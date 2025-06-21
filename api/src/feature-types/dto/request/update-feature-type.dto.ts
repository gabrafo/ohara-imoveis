import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateFeatureTypeDto } from './create-feature-type.dto';

export class UpdateFeatureTypeDto extends PartialType(CreateFeatureTypeDto) {} 