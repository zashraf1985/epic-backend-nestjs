import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { URLSearchParams } from 'url';

const EPIC_CLIENT_ID = '7104a6de-0683-40db-bb39-e616a30fce94'

@Injectable()
export class SmartOnFhirAuthService {
  private redirectUri = 'http://localhost:3000/epic-auth/token-callback';
  private authUrl: string;
  private tokenUrl: string;

  constructor(private readonly httpService: HttpService) {}

  // Step 1: Fetch Metadata to Get OAuth URLs
  async getMetadata(iss: string): Promise<any> {
    const metadataUrl = `${iss}/metadata`;

    try {
      const response = await firstValueFrom(this.httpService.get(metadataUrl));
      return response.data;
    } catch (error) {
      console.error('Error fetching metadata:', error);
      return null;
    }
  }

  // Step 2: Build Authorization URL for Standalone Launch
  async buildAuthUrl(metadata: any, launchToken: string, iss: string): Promise<string> {
    this.authUrl = metadata.rest[0].security.extension[0].extension.find(
      (ext) => ext.url === 'authorize'
    ).valueUri;

    this.tokenUrl = metadata.rest[0].security.extension[0].extension.find(
      (ext) => ext.url === 'token'
    ).valueUri;

    const state = Math.random().toString(36).substring(7); // Generate a random state

    return `${this.authUrl}?launch=${launchToken}&response_type=code&client_id=${EPIC_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      this.redirectUri
    )}&scope=launch&state=${state}&aud=${encodeURIComponent(iss)}`;
  }

  // Step 3: Exchange Authorization Code for Access Token
  async getAccessToken(authCode: string): Promise<any> { 
    const requestBody = new URLSearchParams();
    requestBody.append('grant_type', 'authorization_code');
    requestBody.append('code', authCode);
    requestBody.append('redirect_uri', this.redirectUri);
    requestBody.append('client_id', EPIC_CLIENT_ID);    

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.tokenUrl, requestBody.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
      );

      return response.data;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      return null;
    }
  }
}