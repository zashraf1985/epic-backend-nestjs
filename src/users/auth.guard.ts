import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UsersService } from './users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private loginUrl: string;

  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {    
    const request = context.switchToHttp().getRequest();

    //TODO: Move base to config
    this.loginUrl = `${request.protocol}://${request.get('host')}/users/login/patient`;

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new ForbiddenException({
        error: 'No Token Provided',
        login_url: this.loginUrl,
      });
    }

    let payload;
    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch (e) {
      this.throwForbiddenException(
        'Invalid Token, Please Re-Authenticate with the given api url',
      );
    }

    let requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    // If method has no roles, check at the class level
    if (!requiredRoles) {
      requiredRoles = this.reflector.get<string[]>('roles', context.getClass());
    }

    if (!requiredRoles || requiredRoles.includes(payload.role)) {
      const user = await this.usersService.getUserById(payload.sub);
      if (user == null) {
        this.throwForbiddenException(
          'User not found, Please Re-Authenticate with the given api url',
        );
        return false;
      }
      request['epic_access_token'] = user.access_token;
      request['epic_scope'] = user.scope;
      request['epic_fhir_id'] = user.fhir_id;
      const expiry = user.expires_at;
      if (expiry.getTime() <= Date.now()) {
        this.throwForbiddenException(
          'Epic Access Token Expired, Please Re-Authenticate with the given api url',
        );
      }
      return true;
    }

    this.throwForbiddenException(
      'Insufficient Permissions, Please Re-Authenticate with the given api url',
    );
    return false;
  }

  private throwForbiddenException(message: string): void {
    throw new ForbiddenException({
      error: message,
      login_url: this.loginUrl,
    });
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
