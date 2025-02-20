import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';
import { PatientsModule } from './patients/patients.module';
import { AppConfigModule } from './config/config.module';
import { AppConfigService } from './config/config.service';

@Module({
    imports: [
        UsersModule,
        PatientsModule,
        TypeOrmModule.forRootAsync({
            imports: [AppConfigModule],
            inject: [AppConfigService],
            useFactory: (configService: AppConfigService) => ({
                type: 'postgres',
                host: configService.databaseInfo.host,
                port: configService.databaseInfo.port,
                username: configService.databaseInfo.username,
                password: configService.databaseInfo.password,
                database: configService.databaseInfo.database,
                entities: [User],
                synchronize: true,
            }),
        })],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
