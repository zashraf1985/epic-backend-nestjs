import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PatientsService {
  private readonly MEDICATION_REQUEST_API =
    'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/MedicationRequest';

  constructor(private readonly httpService: HttpService) {}

  async getPatientMedications(patientFhirId: string, accessToken: string) {
    try {
      const url = `${this.MEDICATION_REQUEST_API}?patient=${patientFhirId}`;

      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/fhir+json',
          },
        }),
      );

      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || error.message,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
