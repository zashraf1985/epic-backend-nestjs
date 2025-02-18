import { Module } from '@nestjs/common';
import { EpicAuthController } from './epic-auth.controller';
import { BackendServiceAuthService } from './backend-auth.service';
import { JwtModule } from '@nestjs/jwt';
import * as fs from 'fs';
import { HttpModule } from '@nestjs/axios';
import { SmartOnFhirAuthService } from './smart-on-fhir-auth.service';

let privateKey = ""

try {
    privateKey = fs.readFileSync('private_key.pem', 'utf8')
} catch (error) {
    console.warn('Error reading private key:', error)
}

@Module({
    controllers: [EpicAuthController],
    providers: [BackendServiceAuthService, SmartOnFhirAuthService],
    imports: [
        JwtModule.register({
            privateKey,
        }),
        HttpModule,
    ],
})
export class EpicAuthModule { }
