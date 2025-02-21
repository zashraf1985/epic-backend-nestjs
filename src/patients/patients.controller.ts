import { Controller, Get, Param, UseGuards } from '@nestjs/common';
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

  @Get('allergies')
  async getAllergies(
    @EpicFhirId() epicFhirId: string,
    @EpicAccessToken() epicAccessToken: string,
  ): Promise<any> {
    return await this.patientsService.getAllergies(epicFhirId, epicAccessToken);
  }


  // New endpoint for GET by allergy list ID
  @Get('List/:id')
  async getAllergyListById(
    @Param('id') id: string,
    @EpicFhirId() epicFhirId: string,
    @EpicAccessToken() epicAccessToken: string,
  ) {
    return this.patientsService.getAllergyListById(id, epicAccessToken);
  }
  @Get('medications')
  async getMedications(
    @EpicAccessToken() epicAccessToken: string,
    @EpicFhirId() epicFhirId: string
  ) {
    return await this.patientsService.getPatientMedications(epicFhirId, epicAccessToken);
  }
}
