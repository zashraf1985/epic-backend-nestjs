import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

const R4_BASE_PATH = '/interconnect-amcurprd-oauth/api/FHIR/R4'

@Injectable()
export class PatientsService {
    constructor(private readonly httpService: HttpService) { }

    async getPatientMedications(epicFhirId: string, epicAccessToken: string) {
      const response = await firstValueFrom(
        this.httpService.get(
            `${R4_BASE_PATH}/MedicationRequest?patient=${epicFhirId}`, {
            headers: {
                Authorization: `Bearer ${epicAccessToken}`,
                'Content-Type': 'application/fhir+json',
            },
        }),
    );

    return this.parseMedications(response.data);
    }

    async getDemographics(epicFhirId: string, epicAccessToken: string) {
        const resp = await firstValueFrom(
            this.httpService.get(
                `${R4_BASE_PATH}/patient/${epicFhirId}`,
                {
                    headers: {
                        Authorization: `Bearer ${epicAccessToken}`,
                        Accept: 'application/fhir+json',
                    }
                }
            ))

        return this.parseDemographics(resp.data);
    }

    async getPatientClinicalNotes(epicFhirId: string, epicAccessToken: string) {
      const response = await firstValueFrom(
          this.httpService.get(
              `${R4_BASE_PATH}/DocumentReference?patient=${epicFhirId}&_count=10`,
              {
                  headers: {
                      Authorization: `Bearer ${epicAccessToken}`,
                      Accept: 'application/fhir+json',
                  }
              }
          ))

      return this.parseClinicalNotes(response.data);
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

    parseMedications(medicationData: any) {
        if (!medicationData || !medicationData.entry) {
            return { patient: "Unknown", medications: [] };
        }

        const patientName = medicationData.entry.find(
            (entry: any) => entry.resource?.subject?.display
        )?.resource?.subject?.display || "Unknown";

        const validEntries = medicationData.entry.filter(
            (entry: any) => entry.resource?.resourceType === "MedicationRequest"
        );

        const medications = validEntries.map((entry: any) => {
            const dosageInstruction = entry.resource.dosageInstruction?.[0] || {};
            const timing = dosageInstruction.timing?.repeat?.boundsPeriod || {};

            return {
                medicationName: entry.resource.medicationReference?.display || "Unknown",
                dosage: dosageInstruction.patientInstruction || dosageInstruction.text || "Unknown",
                route: dosageInstruction.route?.text || "Unknown",
                frequency: dosageInstruction.timing?.code?.text || "Unknown",
                startDate: timing.start || "Unknown",
                endDate: timing.end || "Ongoing", // Use "Ongoing" if no end date
                status: entry.resource.status || "Unknown",
                prescriber: entry.resource.requester?.display || "Unknown",
            };
        });

        return {
            patient: patientName,
            medications,
        };
    }

    parseClinicalNotes(data: any): any[] {
      if (!data || !data.entry) return [];
    
      const validEntries = data.entry.filter(
        (entry: any) => entry.resource?.hasOwnProperty('id')
      );
    
      return validEntries.map((entry: any) => {
        const resource = entry.resource;
        
        return {
          id: resource.id,
          date: resource.date,
          author: resource.author?.[0]?.display || 'Unknown',
          type: resource.type?.text || 'Unknown',
          subject: resource.subject?.display || 'Unknown',
          status: resource.status || 'Unknown',
          category: resource.category?.[0]?.text || 'Unknown',
          authenticator: resource.authenticator?.display || 'Unknown',
          custodian: resource.custodian?.display || 'Unknown',
          encounter: resource.context?.encounter?.[0]?.display || 'Unknown',
          content: resource.content && Array.isArray(resource.content)
            ? resource.content.map((c: any) => ({
                type: c.attachment?.contentType || 'Unknown',
                url: c.attachment?.url || 'Unknown',
              }))
            : [],
        };
      });
    }
    
}

