import { Module } from '@nestjs/common';
import { PatientsController } from './patients.controller';
import { UsersModule } from 'src/users/users.module';
import { HttpModule } from '@nestjs/axios';
import { PatientsService } from './patients.service';
import { AppConfigModule } from 'src/config/config.module';
import { AppConfigService } from 'src/config/config.service';

@Module({
    controllers: [PatientsController],
    imports: [
        AppConfigModule,
        UsersModule,
        HttpModule.registerAsync({
            imports: [AppConfigModule],
            inject: [AppConfigService],
            useFactory: (configService: AppConfigService) => ({
                baseURL: configService.epicBaseUrl,
            }),
        })        
    ],
    providers: [PatientsService],
})
export class PatientsModule { }
