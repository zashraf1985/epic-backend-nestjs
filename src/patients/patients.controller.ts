import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../users/auth.guard';
import { EpicAccessToken, EpicFhirId, Roles } from 'src/users/users.service';
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
    ): Promise<any> {
        return await this.patientsService.getDemographics(epicFhirId, epicAccessToken);
    }

  @Get('medications')
  async getMedications(
    @EpicAccessToken() epicAccessToken: string,
    @EpicFhirId() epicFhirId: string
  ) {
    return await this.patientsService.getPatientMedications(epicFhirId, epicAccessToken);
  }

  @Get('clinical-notes')
  async getClinicalNotes(
    @EpicAccessToken() epicAccessToken: string,
    @EpicFhirId() epicFhirId: string
  ) {
    return await this.patientsService.getPatientClinicalNotes(epicFhirId, epicAccessToken);
  }
}
