import {
  createParamDecorator,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, User } from './user.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { URLSearchParams } from 'url';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from 'src/config/config.service';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);

export const EpicAccessToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request['epic_access_token'];
  },
);

export const EpicFhirId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
      const request = ctx.switchToHttp().getRequest();
      return request['epic_fhir_id'];
    },
  );

export const EpicScope = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request['epic_scope'];
  },
);

@Injectable()
export class UsersService {
  private authUrl: string;
  private tokenUrl: string;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
    private readonly configService: AppConfigService,
  ) {}

  private get redirectUri() {
    return `${this.configService.appBaseUrl}/users/login/token-callback`;    
  }

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
  async buildAuthUrl(
    metadata: any,
    launchToken: string,
    iss: string,
  ): Promise<string> {
    this.authUrl = metadata.rest[0].security.extension[0].extension.find(
      (ext) => ext.url === 'authorize',
    ).valueUri;

    this.tokenUrl = metadata.rest[0].security.extension[0].extension.find(
      (ext) => ext.url === 'token',
    ).valueUri;

    const state = Math.random().toString(36).substring(7); // Generate a random state

    return `${this.authUrl}?launch=${launchToken}&response_type=code&client_id=${this.configService.epicPatientAppClientId}&redirect_uri=${encodeURIComponent(
      this.redirectUri,
    )}&scope=launch&state=${state}&aud=${encodeURIComponent(iss)}`;
  }

  // Step 3: Exchange Authorization Code for Access Token
  async getJWT(authCode: string): Promise<any> {
    const requestBody = new URLSearchParams();
    requestBody.append('grant_type', 'authorization_code');
    requestBody.append('code', authCode);
    requestBody.append('redirect_uri', this.redirectUri);
    requestBody.append('client_id', this.configService.epicPatientAppClientId);

    if (this.tokenUrl === undefined) {
      this.tokenUrl =
        'https://vendorservices.epic.com/interconnect-amcurprd-oauth/oauth2/token';
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.tokenUrl, requestBody.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      );

      const idTokenDecoded = this.jwtService.decode(response.data.id_token);
      console.log('response.data:', response.data);
      console.log('Decoded ID Token:', idTokenDecoded);
      let user = await this.usersRepository.findOneBy({
        fhir_id: idTokenDecoded.sub,
      });
      if (user == null) {
        user = this.usersRepository.create({
          fhir_id: idTokenDecoded.sub,
          access_token: response.data.access_token,
          expires_at: new Date(Date.now() + response.data.expires_in * 1000),
          role: idTokenDecoded.fhirUser.split('/')[7],
          dstu2_id: response.data['__epic.dstu2.patient'],
          scope: response.data.scope,
        });
      } else {
        user.access_token = response.data.access_token;
        user.expires_at = new Date(
          Date.now() + response.data.expires_in * 1000,
        );
        user.scope = response.data.scope;
        user.role = idTokenDecoded.fhirUser.split('/')[7];
      }
      await this.usersRepository.save(user);

      // 🔥 Generate JWT with user ID & type
      const jwtPayload = {
        sub: user.id,
        role: user.role,
      };

      console.log('Generated JWT:', jwtPayload);

      return this.jwtService.sign(jwtPayload);
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      return null;
    }
  }

  async buildStandaloneAuthUrl(): Promise<string> {
    const state = Math.random().toString(36).substring(7);
    return `https://vendorservices.epic.com/interconnect-amcurprd-oauth/oauth2/authorize?client_id=${this.configService.epicPatientAppClientId}&scope=openid%20fhirUser&response_type=code&redirect_uri=${encodeURIComponent(this.redirectUri)}&state=${state}&aud=https%3A%2F%2Fvendorservices.epic.com%2Finterconnect-amcurprd-oauth%2Fapi%2FFHIR%2FR4`;
  }

  async getUserById(id: number): Promise<User | null> {
    return await this.usersRepository.findOneBy({ id: id });
  }
}
