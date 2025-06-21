import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DeepPartial, Equal, LessThan, MoreThan, Not, Repository } from 'typeorm';
import { Visit } from './entities/visit.entity';
import { CreateVisitDto } from './dto/request/create-visit.dto';
import { UpdateVisitDto } from './dto/request/update-visit.dto';
import { PropertiesService } from '../properties/properties.service';
import { UsersService } from '../users/users.service';
import { VisitStatus } from '../common/enums/visit-status.enum';
import { User } from 'src/users/entities/users.entity';
import { ScheduleVisitDto } from './dto/request/schedule-visit.dto';
import { AssumeVisitDto } from './dto/request/assume-visit.dto';
import { UpdateScheduleDto } from './dto/request/update-schedule.dto';

@Injectable()
export class VisitsService {
  constructor(
    @InjectRepository(Visit)
    private visitRepository: Repository<Visit>,
    private readonly propertiesService: PropertiesService,
    private readonly usersService: UsersService,
  ) {}

  async create(createVisitDto: CreateVisitDto): Promise<Visit> {
    const { propertyId, customerId, brokerId, visitDateTime } = createVisitDto;
    
    // Verifica se a propriedade existe
    const property = await this.propertiesService.findOne(propertyId);
    
    // Verifica se o usuário existe
    const customer = await this.usersService.findById(customerId);
    const broker = await this.usersService.findById(brokerId);
    
    // Converte a string de data para objeto Date
    const visitDate = new Date(visitDateTime);
    
    // Verifica se a data da visita é futura
    if (visitDate <= new Date()) {
      throw new BadRequestException('A data da visita deve ser futura');
    }
    
    // Verifica se já existe uma visita agendada para o mesmo horário na mesma propriedade
    const existingVisit = await this.visitRepository.findOne({
      where: {
        property: { propertyId },
        visitDateTime: Equal(visitDate),
        visitStatus: VisitStatus.SCHEDULED,
      },
    });
    
    if (existingVisit) {
      throw new BadRequestException('Já existe uma visita agendada para este horário nesta propriedade');
    }
    
    // Cria a visita
    const visit = this.visitRepository.create({
      visitDateTime: visitDate,
      visitStatus: createVisitDto.visitStatus || VisitStatus.SCHEDULED,
      property,
      customer,
      broker,
    } as DeepPartial<Visit>);
    
    return this.visitRepository.save(visit);
  }

  async updateSchedule(visitId: number, customerId: number, dto: UpdateScheduleDto): Promise<Visit> {
    const visit = await this.findOne(visitId);
    if (visit.customer.userId !== customerId) {
      throw new ForbiddenException('Você só pode alterar suas próprias visitas');
    }
    const newDate = new Date(dto.visitDateTime!);
    await this.validateVisitDateTime(visit, newDate);
    visit.visitDateTime = newDate;
    return this.visitRepository.save(visit);
  }

  async scheduleVisit(scheduleVisitDto: ScheduleVisitDto, customerId: number): Promise<Visit> {
    const { propertyId, visitDateTime } = scheduleVisitDto;

    const property = await this.propertiesService.findOne(propertyId);

    if (!property) {
      throw new NotFoundException('Propriedade não encontrada');
    }

    const customer = await this.usersService.findById(customerId);

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }
  
    const newDate = new Date(visitDateTime);
  
    // Cria um objeto Visit parcial apenas para passar para o validador
    const partialVisit = {
      property,
      visitId: 0,
    } as Visit;
  
    await this.validateVisitDateTime(partialVisit, newDate);
  
    const visit = this.visitRepository.create({
      visitDateTime: newDate,
      visitStatus: VisitStatus.WAITING_CONFIRMATION,
      property,
      customer,
    });
  
    return this.visitRepository.save(visit);
  }
  
  async cancelVisit(visitId: number, customerId: number): Promise<void> {
    const visit = await this.findOne(visitId);
  
    if (visit.customer.userId !== customerId) {
      throw new ForbiddenException('Você só pode cancelar suas próprias visitas');
    }
  
    if (visit.visitStatus === VisitStatus.CANCELED) {
      throw new BadRequestException('A visita já está cancelada');
    }
  
    visit.visitStatus = VisitStatus.CANCELED;
    await this.visitRepository.save(visit);
  }

  async assumeVisit(assumeVisitDto: AssumeVisitDto): Promise<Visit> {
    const { visitId, brokerId } = assumeVisitDto;

    const visit = await this.visitRepository.findOne({
      where: { visitId },
    });
    
    if (!visit) {
      throw new NotFoundException(`Visita com ID ${visitId} não encontrada`);
    }

    if (visit.broker) {
      throw new BadRequestException('A visita já foi assumida por outro corretor!');
    }

    if (visit.visitStatus !== VisitStatus.WAITING_CONFIRMATION && visit.visitStatus !== VisitStatus.SCHEDULED) {
      throw new BadRequestException('A visita não está disponível para ser assumida!');
    }

    const broker = await this.usersService.findById(brokerId);

    visit.broker = broker as User;
    visit.visitStatus = VisitStatus.SCHEDULED;

    return this.visitRepository.save(visit);
  }

  async findAll(status?: VisitStatus, startDate?: Date, endDate?: Date): Promise<Visit[]> {
    const where: any = {};
    
    if (status) {
      where.visitStatus = status;
    }
    
    if (startDate && endDate) {
      where.visitDateTime = Between(startDate, endDate);
    } else if (startDate) {
      where.visitDateTime = MoreThan(startDate);
    } else if (endDate) {
      where.visitDateTime = LessThan(endDate);
    }
    
    return this.visitRepository.find({
      where,
      relations: ['property', 'customer'],
      order: { visitDateTime: 'ASC' },
    });
  }

  async findByCustomer(customerId: number, status?: VisitStatus): Promise<Visit[]> {
    // Verifica se o usuário existe
    await this.usersService.findById(customerId);
    
    const where: any = { customer: { id: customerId } };
    
    if (status) {
      where.visitStatus = status;
    }
    
    return this.visitRepository.find({
      where,
      relations: ['property'],
      order: { visitDateTime: 'ASC' },
    });
  }

  async findByProperty(propertyId: number, status?: VisitStatus): Promise<Visit[]> {
    // Verifica se a propriedade existe
    this.propertiesService.findOne(propertyId);
    
    const where: any = { property: { propertyId } };
    
    if (status) {
      where.visitStatus = status;
    }
    
    return this.visitRepository.find({
      where,
      relations: ['customer'],
      order: { visitDateTime: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Visit> {
    const visit = await this.visitRepository.findOne({
      where: { visitId: id },
      relations: ['property', 'customer'],
    });
    
    if (!visit) {
      throw new NotFoundException(`Visita com ID ${id} não encontrada`);
    }
    
    return visit;
  }

  async update(id: number, updateVisitDto: UpdateVisitDto): Promise<Visit> {
    const visit = await this.findOne(id);
    
    const newDate = new Date(updateVisitDto.visitDateTime!);
    if (await this.validateVisitDateTime(visit, newDate)) {
      visit.visitDateTime = newDate;
    }

    if (updateVisitDto.visitStatus) {
      visit.visitStatus = updateVisitDto.visitStatus;
    }
    
    return this.visitRepository.save(visit);
  }

  async updateStatus(id: number, status: VisitStatus): Promise<Visit> {
    const visit = await this.findOne(id);
    visit.visitStatus = status;
    return this.visitRepository.save(visit);
  }

  async remove(id: number): Promise<void> {
    const result = await this.visitRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`Visita com ID ${id} não encontrada`);
    }
  }

  private async validateVisitDateTime(visit: Visit, newDate: Date): Promise<boolean> {
    if (newDate <= new Date(Date.now())) {
      throw new BadRequestException('A data da visita deve ser futura');
    }
  
    const existingVisit = await this.visitRepository.findOne({
      where: {
        property: { propertyId: visit.property.propertyId },
        visitDateTime: Equal(newDate),
        visitStatus: VisitStatus.SCHEDULED,
        visitId: Not(visit.visitId),
      },
    });
  
    if (existingVisit) {
      throw new BadRequestException('Já existe uma visita agendada para este horário nesta propriedade');
    }

    return true;
  }
}