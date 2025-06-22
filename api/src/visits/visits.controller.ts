import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { VisitsService } from './visits.service';
import { CreateVisitDto } from './dto/request/create-visit.dto';
import { UpdateVisitDto } from './dto/request/update-visit.dto';
import { ScheduleVisitDto } from './dto/request/schedule-visit.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { VisitResponseDto } from './dto/response/visit.response.dto';
import { VisitStatus } from '../common/enums/visit-status.enum';
import { Roles, RolesGuard } from 'src/auth/guards/roles.guard';
import { ResourceOwnerGuard } from 'src/auth/guards/resource-owner.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { AssumeVisitDto } from './dto/request/assume-visit.dto';
import { UpdateScheduleDto } from './dto/request/update-schedule.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/entities/users.entity';

@ApiTags('Visitas')
@Controller('visits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova visita' })
  @ApiResponse({
    status: 201,
    description: 'Visita criada com sucesso',
    type: VisitResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou conflito de horário' })
  @ApiResponse({ status: 404, description: 'Propriedade ou usuário não encontrado' })
  @Roles('ADMIN', 'BROKER')
  async create(@Body() createVisitDto: CreateVisitDto): Promise<VisitResponseDto> {
    const visit = await this.visitsService.create(createVisitDto);
    return new VisitResponseDto(visit);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as visitas' })
  @ApiQuery({ name: 'status', enum: VisitStatus, required: false })
  @ApiQuery({ name: 'startDate', description: 'Data inicial (ISO 8601)', required: false })
  @ApiQuery({ name: 'endDate', description: 'Data final (ISO 8601)', required: false })
  @ApiResponse({
    status: 200,
    description: 'Lista de visitas retornada com sucesso',
    type: [VisitResponseDto],
  })
  @Roles('ADMIN', 'BROKER')
  async findAll(
    @Query('status') status?: VisitStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<VisitResponseDto[]> {
    const startDateObj = startDate ? new Date(startDate) : undefined;
    const endDateObj = endDate ? new Date(endDate) : undefined;
    
    const visits = await this.visitsService.findAll(status, startDateObj, endDateObj);
    return visits.map(visit => new VisitResponseDto(visit));
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Listar visitas de um cliente' })
  @ApiParam({ name: 'customerId', description: 'ID do cliente' })
  @ApiQuery({ name: 'status', enum: VisitStatus, required: false })
  @ApiResponse({
    status: 200,
    description: 'Lista de visitas do cliente retornada com sucesso',
    type: [VisitResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Cliente não encontrado' })
  @Roles('ADMIN', 'BROKER')
  async findByCustomer(
    @Param('customerId', ParseIntPipe) customerId: number,
    @Query('status') status?: VisitStatus,
  ): Promise<VisitResponseDto[]> {
    const visits = await this.visitsService.findByCustomer(customerId, status);
    return visits.map(visit => new VisitResponseDto(visit));
  }

  @Get('property/:propertyId')
  @ApiOperation({ summary: 'Listar visitas de uma propriedade' })
  @ApiParam({ name: 'propertyId', description: 'ID da propriedade' })
  @ApiQuery({ name: 'status', enum: VisitStatus, required: false })
  @ApiResponse({
    status: 200,
    description: 'Lista de visitas da propriedade retornada com sucesso',
    type: [VisitResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Propriedade não encontrada' })
  @Roles('ADMIN', 'BROKER')
  async findByProperty(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Query('status') status?: VisitStatus,
  ): Promise<VisitResponseDto[]> {
    const visits = await this.visitsService.findByProperty(propertyId, status);
    return visits.map(visit => new VisitResponseDto(visit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma visita pelo ID' })
  @ApiParam({ name: 'id', description: 'ID da visita' })
  @ApiResponse({
    status: 200,
    description: 'Visita encontrada',
    type: VisitResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Visita não encontrada' })
  @Roles('ADMIN', 'BROKER')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<VisitResponseDto> {
    const visit = await this.visitsService.findOne(id);
    return new VisitResponseDto(visit);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma visita' })
  @ApiParam({ name: 'id', description: 'ID da visita' })
  @ApiResponse({
    status: 200,
    description: 'Visita atualizada com sucesso',
    type: VisitResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou conflito de horário' })
  @ApiResponse({ status: 404, description: 'Visita não encontrada' })
  @Roles('ADMIN', 'BROKER')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVisitDto: UpdateVisitDto,
  ): Promise<VisitResponseDto> {
    const visit = await this.visitsService.update(id, updateVisitDto);
    return new VisitResponseDto(visit);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualizar o status de uma visita' })
  @ApiParam({ name: 'id', description: 'ID da visita' })
  @ApiResponse({
    status: 200,
    description: 'Status da visita atualizado com sucesso',
    type: VisitResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Status inválido' })
  @ApiResponse({ status: 404, description: 'Visita não encontrada' })
  @Roles('ADMIN', 'BROKER')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: VisitStatus,
  ): Promise<VisitResponseDto> {
    const visit = await this.visitsService.updateStatus(id, status);
    return new VisitResponseDto(visit);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover uma visita' })
  @ApiParam({ name: 'id', description: 'ID da visita' })
  @ApiResponse({ status: 204, description: 'Visita removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Visita não encontrada' })
  @Roles('ADMIN', 'BROKER')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.visitsService.remove(id);
  }

  @Post('schedule')
  @ApiOperation({ summary: 'Agendar uma visita (cliente)' })
  @ApiResponse({ status: 201, description: 'Visita agendada com sucesso', type: VisitResponseDto })
  @ApiResponse({ status: 404, description: 'Propriedade ou usuário não encontrado' })
  @Roles('CUSTOMER')
  async schedule(
    @Body() scheduleVisitDto: ScheduleVisitDto,
    @CurrentUser() user: User,
  ): Promise<VisitResponseDto> {
    const visit = await this.visitsService.scheduleVisit(scheduleVisitDto, user.userId);
    return new VisitResponseDto(visit);
  }

  @Patch(':id/schedule')
  @ApiOperation({ summary: 'Atualizar uma visita agendada' })
  @ApiParam({ name: 'id', description: 'ID da visita' })
  @ApiResponse({ status: 200, description: 'Visita atualizada com sucesso', type: VisitResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou conflito de horário' })
  @ApiResponse({ status: 404, description: 'Visita não encontrada' })
  @Roles('CUSTOMER')
  async updateSchedule(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateScheduleDto: UpdateScheduleDto,
    @CurrentUser() user: User,
  ): Promise<VisitResponseDto> {
    const visit = await this.visitsService.updateSchedule(id, user.userId, updateScheduleDto);
    return new VisitResponseDto(visit);
  }

  @Post(':id/assume')
  @ApiOperation({ summary: 'Assumir uma visita (corretor)' })
  @ApiParam({ name: 'id', description: 'ID da visita' })
  @ApiResponse({ status: 200, description: 'Visita assumida', type: VisitResponseDto })
  @ApiResponse({ status: 400, description: 'Visita já assumida ou cancelada' })
  @ApiResponse({ status: 404, description: 'Visita não encontrada' })
  @Roles('BROKER')
  async assume(@Param('id', ParseIntPipe) id: number, @Body() assumeVisitDto: AssumeVisitDto): Promise<VisitResponseDto> {
    const visit = await this.visitsService.assumeVisit({ ...assumeVisitDto, visitId: id } );
    return new VisitResponseDto(visit);
  }
}
