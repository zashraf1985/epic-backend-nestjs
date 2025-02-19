import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as fs from 'fs';
import { randomUUID } from 'crypto';

const EPIC_CLIENT_ID = '479607e4-76df-42ec-b589-2996ffd0f54f';

@Injectable()
export class BackendServiceAuthService {
  private privateKey: string;

  constructor(private readonly jwtService: JwtService) {
    // Load private key from a file
    //this.privateKey = fs.readFileSync('private_key.pem', 'utf8');
  }

  generateJWT(): string {
    const payload = {
      iss: EPIC_CLIENT_ID,
      sub: EPIC_CLIENT_ID,
      aud: 'https://vendorservices.epic.com/interconnect-amcurprd-oauth/oauth2/token',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 300,
      jti: randomUUID(),
    };

    console.log('Coming From New Service');
    console.log(payload);

    return this.jwtService.sign(payload, {
      header: {
        alg: 'RS256',
        typ: 'JWT',
        kid: '4C5759B847A25E1B4157862E0B30EFE4CE226E1E',
      },
    });
  }

  async getAccessToken(): Promise<any> {
    const jwtToken = this.generateJWT();

    console.log(jwtToken);

    const response = await fetch(
      'https://vendorservices.epic.com/interconnect-amcurprd-oauth/oauth2/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_assertion_type:
            'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
          client_assertion: jwtToken,
        }),
      },
    );

    const rawResponse = await response.text();
    console.log('🔹 Raw Response from Epic:\n', rawResponse);

    return rawResponse;
  }
}
