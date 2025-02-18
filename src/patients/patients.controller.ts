import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../users/auth.guard';
import { EpicAccessToken, EpicScope, Roles } from 'src/users/users.service';
import { Role } from 'src/users/user.entity';

@Controller('patients')
@Roles(Role.PATIENT)
@UseGuards(AuthGuard)
export class PatientsController {
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
}
