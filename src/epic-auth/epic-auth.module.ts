import { Module } from '@nestjs/common';
import { EpicAuthController } from './epic-auth.controller';
import { BackendServiceAuthService } from './backend-auth.service';
import { JwtModule } from '@nestjs/jwt';
import * as fs from 'fs';
import { HttpModule } from '@nestjs/axios';
import { SmartOnFhirAuthService } from './smart-on-fhir-auth.service';

const private_key = fs.readFileSync('private_key.pem', 'utf8');

@Module({
  controllers: [EpicAuthController],
  providers: [BackendServiceAuthService, SmartOnFhirAuthService],
  imports: [
    JwtModule.register({
      privateKey: private_key,
    }),
    HttpModule,
  ],
})
export class EpicAuthModule {}
