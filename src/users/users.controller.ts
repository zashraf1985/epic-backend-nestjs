import {
  Controller,
  Get,
  HttpException,
  Query,
  Redirect,
  UseGuards,
} from '@nestjs/common';
import {
  UsersService,
  Roles,
  EpicAccessToken,
  EpicScope,
} from './users.service';
import { Role } from './user.entity';
import { AuthGuard } from './auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('launch-callback')
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

    const metadata = await this.userService.getMetadata(queryParams['iss']);
    if (!metadata) {
      return new HttpException('Error fetching metadata', 500);
    }

    return {
      url: await this.userService.buildAuthUrl(
        metadata,
        queryParams['launch'],
        queryParams['iss'],
      ),
    };
  }

  @Get('/login/token-callback')
  async handleCallback(@Query('code') authCode: string) {
    const tokenResponse = await this.userService.getJWT(authCode);

    if (!tokenResponse) {
      return new HttpException('Failed to retrieve access token', 400);
    }

    return {
      access_token: tokenResponse,
      token_type: 'Bearer',
      expires_in: 3600,
    };
  }

  @Get('login/patient')
  @Redirect()
  async startStandaloneLaunch(): Promise<any> {
    return { url: await this.userService.buildStandaloneAuthUrl() };
  }

  @Get('test-auth-api')
  @Roles(Role.PATIENT)
  @UseGuards(AuthGuard)
  async testAuthApi(
    @EpicAccessToken() epicAccessToken: string,
    @EpicScope() epicScope: string,
  ) {
    console.log('Epic Access Token:', epicAccessToken);
    console.log('Epic Scope:', epicScope);
    return 'Hello';
  }
}
