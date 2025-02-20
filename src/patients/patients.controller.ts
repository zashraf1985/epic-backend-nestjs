import { Controller, Get, Param, UseGuards, Res } from '@nestjs/common';
import { AuthGuard } from '../users/auth.guard';
import { EpicAccessToken, EpicFhirId, Roles } from 'src/users/users.service';
import { Role } from 'src/users/user.entity';
import { PatientsService } from './patients.service';
import { Response } from 'express';

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

  @Get('download-clinical-notes/:noteId')
  async getPatientClinicalNotes(
    @Param('noteId') noteId: string,
    @EpicAccessToken() epicAccessToken: string,
    @Res() res: Response,
  ) {
    await this.patientsService.downloadPatientClinicalNotes(noteId, epicAccessToken, res);
  }
}
