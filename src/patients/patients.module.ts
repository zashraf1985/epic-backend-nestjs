import { Module } from '@nestjs/common';
import { PatientsController } from './patients.controller';
import { UsersModule } from 'src/users/users.module';
import { HttpModule } from '@nestjs/axios';
import { PatientsService } from './patients.service';

@Module({
  imports: [UsersModule, HttpModule],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService]
})
export class PatientsModule {}
