import { Module } from '@nestjs/common';
import { EpicAuthController } from './epic-auth.controller';
import { BackendServiceAuthService } from './backend-auth.service';
import { JwtModule } from '@nestjs/jwt';
import * as fs from 'fs';

const private_key = fs.readFileSync('private_key.pem', 'utf8');

@Module({
    controllers: [EpicAuthController],
    providers: [BackendServiceAuthService],
    imports: [
        JwtModule.register({
            privateKey: private_key,
        }),
    ],
})

export class EpicAuthModule {}
