import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { AppConfigService } from './config.service';

@Module({
    imports: [NestConfigModule.forRoot({ isGlobal: true })],
    providers: [AppConfigService],
    exports: [AppConfigService],
})
export class AppConfigModule { }
