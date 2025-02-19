import { Module } from '@nestjs/common';
import { PatientsController } from './patients.controller';
import { UsersModule } from 'src/users/users.module';
import { PatientsService } from './patients.service';
import { HttpModule } from '@nestjs/axios';

@Module({
    controllers: [PatientsController],
    imports: [
        UsersModule,
        HttpModule.register({
            baseURL: 'https://vendorservices.epic.com/interconnect-amcurprd-oauth/api/FHIR/R4',
        })
    ],
    providers: [PatientsService],
})
export class PatientsModule { }
