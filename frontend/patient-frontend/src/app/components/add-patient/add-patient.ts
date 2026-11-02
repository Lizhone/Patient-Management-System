
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-add-patient',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './add-patient.html',
  styleUrl: './add-patient.css'
})
export class AddPatient {

  isLoading = false;
  today = new Date().toISOString().split('T')[0];

  patient = {
    fullName: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    emergencyContact: '',
    medicalHistory: ''
  };

  private apiUrl = 'http://127.0.0.1:5000/api/patients';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  onSubmit(): void {
    if (this.isLoading) return;

    this.isLoading = true;

    this.http.post<any>(this.apiUrl, this.patient).subscribe({
      next: (response) => {
        this.isLoading = false;

        alert(response.message);

        this.onReset();
        this.router.navigate(['/patients']);
      },
      error: (error) => {
        this.isLoading = false;

        alert(
          error.error?.message ||
          'Unable to save patient. Please try again.'
        );
      }
    });
  }

  onReset(): void {
    this.patient = {
      fullName: '',
      dateOfBirth: '',
      gender: '',
      bloodGroup: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      emergencyContact: '',
      medicalHistory: ''
    };
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
