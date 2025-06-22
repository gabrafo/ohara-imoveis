import { ApiProperty } from '@nestjs/swagger';
import { Visit } from '../../entities/visit.entity';
import { VisitStatus } from '../../../common/enums/visit-status.enum';

export class VisitResponseDto {
  @ApiProperty({
    description: 'ID único da visita',
    example: 1,
  })
  visitId: number;

  @ApiProperty({
    description: 'Data e hora da visita',
    example: '2023-12-15T14:30:00Z',
  })
  visitDateTime: Date;

  @ApiProperty({
    description: 'Status da visita',
    enum: VisitStatus,
    example: VisitStatus.SCHEDULED,
  })
  visitStatus: VisitStatus;

  @ApiProperty({
    description: 'ID do cliente que agendou a visita',
    example: 1,
  })
  customerId: number;

  @ApiProperty({
    description: 'Nome do cliente que agendou a visita',
    example: 'João Silva',
  })
  customerName?: string;

  @ApiProperty({
    description: 'Nome do corretor que assumiu a visita',
    example: 'Caio Pereira',
  })
  brokerName?: string;

  @ApiProperty({
    description: 'ID da propriedade a ser visitada',
    example: 1,
  })
  propertyId: number;

  @ApiProperty({
    description: 'ID do corretor que assumiu a visita',
    example: 1,
  })
  brokerId: number;

  constructor(visit: Visit) {
    this.visitId = visit.visitId;
    this.visitDateTime = visit.visitDateTime;
    this.visitStatus = visit.visitStatus;

    if (visit.customer?.userId) {
      this.customerId = visit.customer.userId;
      this.customerName = visit.customer.name;
    }

    if (visit.broker?.userId) {
      this.brokerId = visit.broker.userId;
      this.brokerName = visit.broker.name;
    }
    
    if (visit.property?.propertyId) {
      this.propertyId = visit.property.propertyId;
    }
  }
} 