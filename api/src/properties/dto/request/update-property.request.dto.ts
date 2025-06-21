import { CreateAddressDto } from "../../addresses/dto/request/create-address.request.dto";
import { OfferType } from "../../../common/enums/offer-type.enum";
import { PropertyStatus } from "../../../common/enums/property-status.enum";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, IsPositive } from "class-validator";

export class UpdatePropertyRequestDto {
  @ApiProperty({
    description: 'Informações do endereço',
    type: CreateAddressDto,
    required: false
  })
  address?: CreateAddressDto;

  @ApiProperty({
    description: 'ID do proprietário da propriedade',
    example: 1,
    required: false
  })
  ownerId?: number;

  @ApiProperty({
    description: 'Preço da propriedade',
    example: 250000.00,
    required: false
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  price?: number;

  @ApiProperty({
    description: 'Status da propriedade',
    enum: PropertyStatus,
    example: PropertyStatus.AVAILABLE,
    required: false
  })
  @IsEnum(PropertyStatus)
  @IsNotEmpty()
  status?: PropertyStatus;

  @ApiProperty({
    description: 'Tipo de oferta da propriedade',
    enum: OfferType,
    example: OfferType.FOR_SALE,
    required: false
  })
  @IsEnum(OfferType)
  @IsNotEmpty()
  offerType?: OfferType;

  @ApiProperty({
    description: 'Área da propriedade em metros quadrados',
    example: 120.50,
    required: false
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  area?: number;
} 