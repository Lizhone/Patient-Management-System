
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
}

@Component({
  selector: 'app-edit-patient',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-patient.html',
  styleUrl: './edit-patient.css',
})
export class EditPatient implements OnInit {

  patient: Patient | null = null;
  isLoading = true;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  private apiUrl = 'http://127.0.0.1:5000/api/patients';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const patientId = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(patientId) || patientId <= 0) {
      this.errorMessage = 'Invalid patient ID.';
      this.isLoading = false;
      return;
    }

    this.loadPatient(patientId);
  }

  loadPatient(patientId: number): void {
    this.http.get<any>(`${this.apiUrl}/${patientId}`).subscribe({
      next: (response) => {
        this.patient = response.patient || null;
        this.isLoading = false;

        if (!this.patient) {
          this.errorMessage = 'Patient record not found.';
        }
      },
      error: (error) => {
        console.error('Unable to load patient:', error);
        this.errorMessage = 'Unable to load patient information.';
        this.isLoading = false;
      }
    });
  }

  saveChanges(): void {
    if (!this.patient || this.isSaving) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    this.http.put<any>(
      `${this.apiUrl}/${this.patient.patientId}`,
      this.patient
    ).subscribe({
      next: () => {
        alert('Patient information updated successfully.');
        this.router.navigate(['/patients']);
      },
      error: (error) => {
        console.error('Unable to update patient:', error);

        this.errorMessage =
          error.error?.message || 'Unable to update patient information.';

        this.isSaving = false;
      }
    });
  }

  cancelEdit(): void {
    this.router.navigate(['/patients']);
  }
}
