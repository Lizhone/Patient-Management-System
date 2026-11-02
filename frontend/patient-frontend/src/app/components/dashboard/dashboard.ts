
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

interface Patient {
  patientId: number;
  fullName: string;
  phone: string;
  isViewed: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  // Staff information
  staffName = 'Barcha';
  staffRole = 'ADMIN';

  // Dashboard statistics
  totalPatients = 0;
  newPatients = 0;
  totalBills = 0;
  activeRecords = 0;

  isLoading = true;

  // New patient list
  newPatientList: Patient[] = [];

  private patientApi = 'http://127.0.0.1:5000/api/patients';
  private billApi = 'http://127.0.0.1:5000/api/bills';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {

    // Load patient statistics
    this.http.get<any>(this.patientApi).subscribe({
      next: (response) => {

        this.totalPatients = response.total || 0;
        this.newPatients = response.recent || 0;
        this.activeRecords = response.activeRecords || 0;

        this.newPatientList = (response.patients || [])
          .filter((patient: Patient) => !patient.isViewed);

      },
      error: (error) => {
        console.error('Unable to load patient information:', error);
      }
    });

    // Load billing statistics
    this.http.get<any>(this.billApi).subscribe({
      next: (response) => {
        this.totalBills = response.totalBills || 0;
      },
      error: (error) => {
        console.error('Unable to load billing information:', error);
      }
    });

    this.isLoading = false;
  }

  // Open selected patient's record
  viewPatient(patientId: number): void {
    window.location.href = `/patients/${patientId}`;
  }

  logout(): void {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}
