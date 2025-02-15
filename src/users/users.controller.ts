import { Controller, Get, HttpException, Query, Redirect } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService
    ) {}

    @Get('login/patient')
    async patientLogin(): Promise<any> {
        const user = new User()
        user.fhir_id = '123456'
        const result =  await this.usersService.create(user)
        return result.id
    }
}
