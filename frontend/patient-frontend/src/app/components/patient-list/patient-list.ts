
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Patient {
  patientId: number;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  city: string;
  createdAt: string;
  isViewed: boolean;
}

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-list.html',
  styleUrl: './patient-list.css',
})
export class PatientList implements OnInit {

  patients: Patient[] = [];
  isLoading = true;
  errorMessage = '';

  // Search and filter values
  searchText = '';
  selectedGender = 'All';
  selectedStatus = 'All';

  private apiUrl = 'http://127.0.0.1:5000/api/patients';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<any>(this.apiUrl).subscribe({
      next: (response) => {
        this.patients = response.patients || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Unable to load patients:', error);
        this.errorMessage =
          'Unable to load patient records. Please try again.';
        this.isLoading = false;
      }
    });
  }

  // Search and filter patients
  get filteredPatients(): Patient[] {
    const search = this.searchText.trim().toLowerCase();

    return this.patients.filter(patient => {

      const matchesSearch =
        !search ||
        patient.patientId.toString().includes(search) ||
        (patient.fullName || '').toLowerCase().includes(search) ||
        (patient.phone || '').toLowerCase().includes(search);

      const matchesGender =
        this.selectedGender === 'All' ||
        (patient.gender || '').toLowerCase() ===
          this.selectedGender.toLowerCase();

      const matchesStatus =
        this.selectedStatus === 'All' ||
        (this.selectedStatus === 'New' && !patient.isViewed) ||
        (this.selectedStatus === 'Viewed' && patient.isViewed);

      return matchesSearch && matchesGender && matchesStatus;
    });
  }

  // Reset filters
  clearFilters(): void {
    this.searchText = '';
    this.selectedGender = 'All';
    this.selectedStatus = 'All';
  }

  // View patient details
  viewPatient(patientId: number): void {
    this.router.navigate(['/patients', patientId]);
  }

  // Open edit page
  editPatient(patientId: number): void {
    this.router.navigate(['/edit-patient', patientId]);
  }

  // Open delete confirmation page
  deletePatient(patientId: number): void {
    this.router.navigate(['/delete-patient', patientId]);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
