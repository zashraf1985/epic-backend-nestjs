import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { firstValueFrom } from "rxjs";

const API_BASE_URL = 'https://vendorservices.epic.com/interconnect-amcurprd-oauth/api/FHIR/R4/';



@Injectable()
export class PatientsService {
    constructor(private httpService: HttpService) { }

    async getDemographics(epicFhirId: string, epicAccessToken: string, epicScope: string) {        
        const resp = await firstValueFrom(
            this.httpService.get(
                `/patient/${epicFhirId}`,
                {
                    headers: {
                        Authorization: `Bearer ${epicAccessToken}`,
                        Accept: 'application/fhir+json',
                    }
                }
        ))        

        return this.parseDemographics(resp.data);
    }

    parseDemographics(patientData: any) {
        return {
            id: patientData.id,
            name: patientData.name?.find(n => n.use === "official")?.text || null,
            preferredName: patientData.name?.find(n => n.use === "usual")?.text || null,
            gender: patientData.gender || null,
            birthDate: patientData.birthDate || null,
            phone: patientData.telecom?.find(t => t.use === "mobile")?.value || 
                   patientData.telecom?.find(t => t.use === "home")?.value || null,
            address: patientData.address?.find(a => a.use === "home") || null,
            maritalStatus: patientData.maritalStatus?.text || null,
            language: patientData.communication?.find(c => c.preferred)?.language?.text || null,
            generalPractitioner: patientData.generalPractitioner?.map(gp => gp.display) || [],
            managingOrganization: patientData.managingOrganization?.display || null
        }
    }
}