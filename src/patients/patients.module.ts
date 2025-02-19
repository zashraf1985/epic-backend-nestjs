import { Module } from '@nestjs/common';
import { PatientsController } from './patients.controller';
import { UsersModule } from 'src/users/users.module';
import { HttpModule } from '@nestjs/axios';
import { PatientService } from './patients.service';

@Module({
  controllers: [PatientsController],
  imports: [UsersModule, HttpModule],
  providers: [PatientService]
})
export class PatientsModule {}
