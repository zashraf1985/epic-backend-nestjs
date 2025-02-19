import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../users/auth.guard';
import { EpicAccessToken, EpicFhirId, EpicScope, Roles } from 'src/users/users.service';
import { Role } from 'src/users/user.entity';
import { PatientsService } from './patients.service';

@Controller('patients')
@Roles(Role.PATIENT)
@UseGuards(AuthGuard)
export class PatientsController {

    constructor(private readonly patientsService: PatientsService) { }

    @Get('demographics')
    async getDemographics(
        @EpicFhirId() epicFhirId: string,
        @EpicAccessToken() epicAccessToken: string,
        @EpicScope() epicScope: string,
    ): Promise<any> {
        return await this.patientsService.getDemographics(epicFhirId, epicAccessToken, epicScope);
    }
}
