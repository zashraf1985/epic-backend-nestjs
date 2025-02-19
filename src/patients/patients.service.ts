import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
@Injectable()
export class PatientService { 
    private readonly _fhirId : string
    constructor(private readonly httpService: HttpService) {}

    async getPatientById(id: string, epicAccessToken: string) {
        const url = `https://hostname/instance/api/FHIR/R4/Patient/${id}`;
        const response = this.httpService.get(url, {
            headers: {
                Authorization: `Bearer ${epicAccessToken}`,
            }
        });
        return response;
    }

}