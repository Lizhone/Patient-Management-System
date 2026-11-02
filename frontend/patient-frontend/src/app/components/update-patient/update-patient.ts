
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

interface Patient {
  patientId: number;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string | null;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  emergencyContact: string | null;
  medicalHistory: string | null;
  createdAt: string | null;
  isViewed: boolean;
}

@Component({
  selector: 'app-update-patient',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './update-patient.html',
  styleUrl: './update-patient.css',
})
export class UpdatePatient implements OnInit {

  patient: Patient | null = null;

  isLoading = true;
  errorMessage = '';

  private apiUrl = 'http://127.0.0.1:5000/api/patients';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('UPDATE PATIENT COMPONENT LOADED');
    const patientId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!Number.isInteger(patientId) || patientId <= 0) {
      this.errorMessage = 'Invalid patient ID.';
      this.isLoading = false;
      return;
    }

    this.loadPatient(patientId);
  }

  // ==========================================
  // LOAD SELECTED PATIENT
  // ==========================================

  loadPatient(patientId: number): void {

    this.http.get<any>(
      `${this.apiUrl}/${patientId}`
    ).subscribe({

      next: (response) => {

        if (!response.patient) {
          this.errorMessage = 'Patient information not found.';
          this.isLoading = false;
          return;
        }

        const selectedPatient: Patient = response.patient;

        this.patient = selectedPatient;

        // Mark patient as viewed
        if (!selectedPatient.isViewed) {
          this.markAsViewed(patientId);
        } else {
          this.isLoading = false;
        }
      },

      error: (error: any) => {

        console.error('Unable to load patient:', error);

        this.errorMessage =
          error.error?.message ||
          'Unable to load patient details.';

        this.isLoading = false;
      }
    });
  }

  // ==========================================
  // MARK PATIENT AS VIEWED
  // ==========================================

  markAsViewed(patientId: number): void {

    this.http.put<any>(
      `${this.apiUrl}/${patientId}/viewed`,
      {}
    ).subscribe({

      next: (response) => {

        if (this.patient) {
          this.patient.isViewed = response.isViewed;
        }

        this.isLoading = false;
      },

      error: (error: any) => {

        console.error('Unable to update viewing status:', error);

        this.errorMessage =
          'Patient details loaded, but viewing status could not be updated.';

        this.isLoading = false;
      }
    });
  }

  // ==========================================
  // BACK TO PATIENT LIST
  // ==========================================

  goBack(): void {
    this.router.navigate(['/patients']);
  }

}
