
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Patient {
  patientId: number;
  fullName: string;
  phone: string;
}

interface Bill {
  billId: number;
  patientId: number;
  patientName: string;
  description: string;
  amount: number;
  paymentStatus: string;
  paymentMethod: string | null;
  billDate: string;
}

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './billing.html',
  styleUrl: './billing.css',
})
export class Billing implements OnInit {

  private patientApi = 'http://127.0.0.1:5000/api/patients';
  private billApi = 'http://127.0.0.1:5000/api/bills';

  patients: Patient[] = [];
  bills: Bill[] = [];

  selectedPatientId: number | null = null;
  description = '';
  amount: number | null = null;
  paymentStatus = 'Pending';
  paymentMethod = 'Cash';

  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPatients();
    this.loadBills();
  }

  loadPatients(): void {
    this.http.get<any>(this.patientApi).subscribe({
      next: (response) => {
        this.patients = response.patients || [];
      },
      error: (error) => {
        console.error('Unable to load patients:', error);
        this.errorMessage = 'Unable to load patient records.';
      }
    });
  }

  loadBills(): void {
    this.isLoading = true;

    this.http.get<any>(this.billApi).subscribe({
      next: (response) => {
        this.bills = response.bills || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Unable to load bills:', error);
        this.errorMessage = 'Unable to load billing records.';
        this.isLoading = false;
      }
    });
  }

  createBill(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (
      !this.selectedPatientId ||
      !this.description.trim() ||
      this.amount === null ||
      this.amount <= 0
    ) {
      this.errorMessage = 'Please complete all required fields with a valid amount.';
      return;
    }

    this.isSaving = true;

    const billData = {
      patientId: this.selectedPatientId,
      description: this.description.trim(),
      amount: this.amount,
      paymentStatus: this.paymentStatus,
      paymentMethod: this.paymentMethod
    };

    this.http.post<any>(this.billApi, billData).subscribe({
      next: (response) => {
        this.successMessage = response.message || 'Bill created successfully.';

        this.selectedPatientId = null;
        this.description = '';
        this.amount = null;
        this.paymentStatus = 'Pending';
        this.paymentMethod = 'Cash';

        this.isSaving = false;
        this.loadBills();
      },
      error: (error) => {
        console.error('Create bill error:', error);
        this.errorMessage =
          error.error?.message || 'Unable to create bill.';
        this.isSaving = false;
      }
    });
  }

  updatePaymentStatus(bill: Bill, status: string): void {
    this.http.put<any>(
      `${this.billApi}/${bill.billId}/status`,
      { paymentStatus: status }
    ).subscribe({
      next: () => {
        this.loadBills();
      },
      error: (error) => {
        console.error('Payment status update error:', error);
        this.errorMessage = 'Unable to update payment status.';
      }
    });
  }

  get totalRevenue(): number {
    return this.bills
      .filter(bill => bill.paymentStatus === 'Paid')
      .reduce((total, bill) => total + bill.amount, 0);
  }

  get pendingAmount(): number {
    return this.bills
      .filter(bill => bill.paymentStatus === 'Pending')
      .reduce((total, bill) => total + bill.amount, 0);
  }

  get paidBills(): number {
    return this.bills.filter(
      bill => bill.paymentStatus === 'Paid'
    ).length;
  }

  get totalBills(): number {
    return this.bills.length;
  }
  goToDashboard(): void {
  window.location.href = '/dashboard';
}
}
