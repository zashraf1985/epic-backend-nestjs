import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { map } from "rxjs";

@Injectable()
export class PatientService { 
    private readonly _fhirId : string
    constructor(private readonly httpService: HttpService) {}

    async getPatientById(id: string) {
        const url = `https://hostname/instance/api/FHIR/R4/Patient/${id}`;
        const response = this.httpService.get(url);
        return response;
    }

}