import { Controller, Get } from '@nestjs/common';
import { BackendServiceAuthService } from './backend-auth.service';

@Controller('epic-auth')
export class EpicAuthController {
    constructor(private readonly backendServiceAuthService: BackendServiceAuthService) {}

    @Get('backend-service')
    async getAccessToken(): Promise<any> {
        return await this.backendServiceAuthService.getAccessToken();
    }
}
