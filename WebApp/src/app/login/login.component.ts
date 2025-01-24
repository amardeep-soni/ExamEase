import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
interface LoginModel {
  email: string;
  password: string;
  rememberMe: boolean;
}

@Component({
  selector: 'app-login',
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginData: LoginModel = {
    email: '',
    password: '',
    rememberMe: false
  };

  isLoading = false;
  showPassword = false;
  errorMessage = '';

  constructor(private router: Router) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit(form: NgForm) {
    if (form.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        // Implement your login logic here
        console.log('Login attempt with:', this.loginData);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // On success, navigate to dashboard
        this.router.navigate(['/dashboard']);
      } catch (error) {
        this.errorMessage = 'Invalid email or password';
      } finally {
        this.isLoading = false;
      }
    }
  }


}
