import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../users/auth.guard';
import { EpicAccessToken, EpicFhirId, EpicScope, Roles } from 'src/users/users.service';
import { Role } from 'src/users/user.entity';
import { PatientsService } from './patients.service';

@Controller('patients')
@Roles(Role.PATIENT)
@UseGuards(AuthGuard)
export class PatientsController {
  constructor(private readonly patientService: PatientsService) {}

  @Get('demographics')
  getDemographics(
    @EpicAccessToken() epicAccessToken: string,
    @EpicScope() epicScope: string,
  ): any {
    return {
      message: 'Auth successful',
      epicAccessToken,
      epicScope,
    };
  }

  @Get('medications')
  async getMedications(
    @EpicAccessToken() epicAccessToken: string,
    @EpicFhirId() epicFhirId: string
  ) {
    return await this.patientService.getPatientMedications(epicFhirId, epicAccessToken);
  }
}
