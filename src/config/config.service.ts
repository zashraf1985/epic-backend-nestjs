import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface DatabaseInfo {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
}

@Injectable()
export class AppConfigService {
    constructor(private configService: ConfigService) { }

    private getStringOrEmpty(key: string): string {
        return this.configService.get<string>(key) || ''
    }

    get databaseInfo(): DatabaseInfo {
        return {
            host: this.getStringOrEmpty('DB_HOST'),
            port: this.configService.get<number>('DB_PORT') || 0,
            username: this.getStringOrEmpty('DB_USER'),
            password: this.getStringOrEmpty('DB_PASSWORD'),
            database: this.getStringOrEmpty('DB_NAME'),
        }
    }

    get jwtSecret(): string {
        return this.getStringOrEmpty('JWT_SECRET')
    }

    get epicPatientAppClientId(): string {
        return this.getStringOrEmpty('EPIC_PATIENT_APP_CLIENT_ID')
    }

    get epicStaffAppClientId(): string {
        return this.getStringOrEmpty('EPIC_STAFF_APP_CLIENT_ID')
    }

    get epicBaseUrl(): string {
        return this.getStringOrEmpty('EPIC_BASE_URL')
    }

    get appBaseUrl(): string {
        return this.getStringOrEmpty('APP_BASE_URL')
    }
}
