
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

interface Patient {
  patientId: number;
  fullName: string;
  dateOfBirth: string;
  gender: string;
}

@Component({
  selector: 'app-delete-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-confirmation.html',
  styleUrl: './delete-confirmation.css',
})
export class DeleteConfirmation implements OnInit {

  patient: Patient | null = null;
  isLoading = true;
  isDeleting = false;
  errorMessage = '';

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
        this.errorMessage = 'Unable to retrieve patient information.';
        this.isLoading = false;
      }
    });
  }

  get patientAge(): number | null {
    if (!this.patient?.dateOfBirth) {
      return null;
    }

    const birthDate = new Date(this.patient.dateOfBirth);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const birthdayNotReached =
      today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
        today.getDate() < birthDate.getDate());

    if (birthdayNotReached) {
      age--;
    }

    return age;
  }

  cancelDelete(): void {
    this.router.navigate(['/patients']);
  }

  confirmDelete(): void {
    if (!this.patient || this.isDeleting) {
      return;
    }

    this.isDeleting = true;
    this.errorMessage = '';

    this.http.delete<any>(
      `${this.apiUrl}/${this.patient.patientId}`
    ).subscribe({
      next: () => {
        alert('Patient record deleted successfully.');
        this.router.navigate(['/patients']);
      },
      error: (error) => {
        console.error('Unable to delete patient:', error);

        this.errorMessage =
          error.error?.message || 'Unable to delete patient record.';

        this.isDeleting = false;
      }
    });
  }
}
