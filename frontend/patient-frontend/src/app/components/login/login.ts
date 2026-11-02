
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface LoginResponse {
  status: string;
  message: string;
  access_token: string;
  staff: {
    id: number;
    name: string;
    username: string;
    role: string;
  };
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  username = '';
  password = '';
  rememberMe = false;
  isLoading = false;

  private apiUrl = 'http://127.0.0.1:5000/api/login';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  onLogin(): void {
    if (!this.username.trim() || !this.password) {
      alert('Please enter your username and password.');
      return;
    }

    this.isLoading = true;

    this.http.post<LoginResponse>(this.apiUrl, {
      username: this.username.trim(),
      password: this.password
    }).subscribe({
      next: (response) => {
        sessionStorage.setItem('access_token', response.access_token);
        sessionStorage.setItem('staff', JSON.stringify(response.staff));

        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;

        const message =
          error.error?.message || 'Unable to connect to the server.';

        alert(message);
      }
    });
  }
}
