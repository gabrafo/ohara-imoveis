import { Module } from '@nestjs/common';
import { OwnersService } from './owners.service';
import { OwnersController } from './owners.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Owner } from './entities/owner.entity';

@Module({
  providers: [OwnersService],
  controllers: [OwnersController],
  imports: [TypeOrmModule.forFeature([Owner])],
  exports: [OwnersService],
})
export class OwnersModule {}
