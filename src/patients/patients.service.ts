import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

const R4_BASE_PATH = '/interconnect-amcurprd-oauth/api/FHIR/R4'

@Injectable()
export class PatientsService {
    constructor(private readonly httpService: HttpService) { }

    async getPatientMedications(epicFhirId: string, epicAccessToken: string) {
        try {
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

        } catch (error) {
            throw new HttpException(
                error.response?.data || error,
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
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

    async getAllergies(epicFhirId: string, epicAccessToken: string) {
        try {
            console.log(`Fetching allergies for patient ID: ${epicFhirId}`);

            const response = await firstValueFrom(this.httpService.get(
                `${R4_BASE_PATH}/List?code=allergies&patient=${epicFhirId}`,
                {
                    headers: {
                        Authorization: `Bearer ${epicAccessToken}`,
                        Accept: 'application/fhir+json',
                    }
                }
            ));

            // Extract only the relevant data from the response
            return this.parseAllergies(response.data);
        } catch (error) {
            console.error("Error fetching allergies:", error);
            throw new HttpException(
                error.response?.data || "Failed to fetch allergies",
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getAllergyListById(allergyListId: string, epicAccessToken: string) {
        try {
            console.log(`Fetching allergy list by ID: ${allergyListId}`);

            const response = await firstValueFrom(this.httpService.get(
                `${R4_BASE_PATH}/List/${allergyListId}`,
                {
                    headers: {
                        Authorization: `Bearer ${epicAccessToken}`,
                        Accept: 'application/fhir+json',
                    }
                }
            ));

            return this.parseAllergyList(response.data);
        } catch (error) {
            console.error("Error fetching allergy list by ID:", error);
            throw new HttpException(
                error.response?.data || "Failed to fetch allergy list",
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    parseAllergyList(allergyResource: any) {
        if (!allergyResource || allergyResource.resourceType !== 'List') {
            return { error: "Invalid resource" };
        }
        return {
            id: allergyResource.id || "Unknown",
            resourceType: allergyResource.resourceType,
            status: allergyResource.status || "Unknown",
            mode: allergyResource.mode || "Unknown",
            title: allergyResource.title || "Unknown",
            code: allergyResource.code?.coding?.[0]?.code || "Unknown",
            subject: allergyResource.subject || {},
            allergies: allergyResource.entry?.map((entry: any) => ({
                allergy: entry.item?.display || "Unknown",
                reference: entry.item?.reference || "Unknown"
            })) || [],
            _raw: allergyResource,

        };
    }

    parseAllergies(allergyData: any) {
        if (!allergyData || !allergyData.entry) {
            return { patient: "Unknown", allergies: [] };
        }

        // Extract patient name
        const patientName = allergyData.entry.find(
            (entry: any) => entry.resource?.subject?.display
        )?.resource?.subject?.display || "Unknown";

        // Extract all allergy-related data
        const allergies = allergyData.entry
            .filter((entry: any) => entry.resource?.resourceType === "List")
            .map((entry: any) => {
                const resource = entry.resource;
                const emptyReason = resource?.emptyReason?.text || null;

                return {
                    fullUrl: entry.fullUrl || "Unknown",
                    id: resource?.id || "Unknown",
                    status: resource?.status || "Unknown",
                    mode: resource?.mode || "Unknown",
                    title: resource?.title || "Unknown",
                    code: resource?.code?.coding?.[0]?.code || "Unknown",
                    emptyReason: emptyReason,
                    allergies: emptyReason
                        ? [{ allergy: "No allergies recorded", reason: emptyReason }]
                        : resource?.entry?.map((item: any) => ({
                            allergy: item.item?.display || "Unknown",
                            reference: item.item?.reference || "Unknown"
                        })) || []
                };
            });

        return {
            patient: patientName,
            allergies
        };
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
}

