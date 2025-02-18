import {
  Controller,  
  HttpException,
  Query,
  Redirect,
} from '@nestjs/common';
import { BackendServiceAuthService } from './backend-auth.service';
import { SmartOnFhirAuthService } from './smart-on-fhir-auth.service';

@Controller('epic-auth')
export class EpicAuthController {
  constructor(
    private readonly backendServiceAuthService: BackendServiceAuthService,
    private readonly smartOnFhirAuthService: SmartOnFhirAuthService,
  ) {}

  //@Get('backend-service')
  async getAccessToken(): Promise<any> {
    return await this.backendServiceAuthService.getAccessToken();
  }

  //@Get('launch-callback')
  @Redirect()
  async launchCallback(
    @Query() queryParams: Record<string, any>,
  ): Promise<any> {
    console.log('Received Launch Callback:', queryParams);
    if (queryParams['error']) {
      return new HttpException(queryParams['error'], 400);
    }

    if (!queryParams['launch']) {
      return new HttpException('Missing launch parameter', 400);
    }

    const metadata = await this.smartOnFhirAuthService.getMetadata(
      queryParams['iss'],
    );
    if (!metadata) {
      return new HttpException('Error fetching metadata', 500);
    }

    return {
      url: await this.smartOnFhirAuthService.buildAuthUrl(
        metadata,
        queryParams['launch'],
        queryParams['iss'],
      ),
    };
  }

  //@Get('token-callback')
  async handleCallback(@Query('code') authCode: string) {
    console.log('Received Auth Code:', authCode);

    // Exchange the authorization code for an access token
    const tokenResponse = await this.smartOnFhirAuthService.getJWT(authCode);

    if (!tokenResponse) {
      return new HttpException('Failed to retrieve access token', 400);
    }

    return { accessToken: tokenResponse };
  }

  //@Get('standalone')
  @Redirect()
  async startStandaloneLaunch(): Promise<any> {
    return { url: await this.smartOnFhirAuthService.buildStandaloneAuthUrl() };
  }
}
