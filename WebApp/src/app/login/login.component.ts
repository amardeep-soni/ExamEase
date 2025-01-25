import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AuthServiceProxy,
  ForgotPasswordDto,
  LoginDto,
  ResetPasswordDto,
} from '../../service-proxies/service-proxies';
import { ServiceProxyModule } from '../../service-proxies/service-proxy.module';
import { AuthService } from '../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ForgotPasswordDialogComponent } from '../dialogs/forgot-password-dialog/forgot-password-dialog.component';

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
    private authService: AuthService,
    private dialog: MatDialog
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

  openForgotPasswordDialog() {
    const dialogRef = this.dialog.open(ForgotPasswordDialogComponent, {
      width: '450px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Forgot Password email:', result);
        this._authService.forgotPassword({ email: result } as ForgotPasswordDto).subscribe((res) => {
          console.log('Reset password response:', res);
        });
            }
    });
  }
}
