import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../users/auth.guard';
import { EpicAccessToken, EpicScope, Roles } from 'src/users/users.service';
import { Role } from 'src/users/user.entity';
import { PatientService } from './patients.service';

@Controller('patients')
@Roles(Role.PATIENT)
@UseGuards(AuthGuard)
export class PatientsController {
  constructor(private patientsService: PatientService){}
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


  @Get(':id')
  async getPatientById(@Param('id') id: string) {
    const patient = await this.patientsService.getPatientById(id);
    return patient;
  }
}
