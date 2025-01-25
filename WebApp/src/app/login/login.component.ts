import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AuthServiceProxy,
  LoginDto,
} from '../../service-proxies/service-proxies';
import { ServiceProxyModule } from '../../service-proxies/service-proxy.module';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ServiceProxyModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginData: LoginDto = {} as LoginDto;
  isLoading = false;
  showPassword = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private _authService: AuthServiceProxy,
    private authService: AuthService
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit(form: NgForm) {
    if (form.valid) {
      console.log('Login form data:', this.loginData);

      try {
        // Implement your login logic here
        console.log('Login attempt with:', this.loginData);
        this._authService.login(this.loginData).subscribe((res) => {
          console.log('Login response:', res);
          if (res.isError === 'false') {
            if (res.message) {
              this.authService.setToken(res.message);
            } else {
              this.errorMessage = 'Login failed: No token received';
            }
          } else {
            this.errorMessage = 'Login failed: No token received';
          }
          this.router.navigate(['/dashboard']);
        });

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } catch (error) {
        this.errorMessage = 'Invalid email or password';
      } finally {
        this.isLoading = false;
      }
    }
  }
}
