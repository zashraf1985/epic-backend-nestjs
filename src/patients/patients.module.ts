import { Module } from '@nestjs/common';
import { PatientsController } from './patients.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [PatientsController],
  imports: [UsersModule],
})
export class PatientsModule {}
