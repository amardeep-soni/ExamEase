import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  AuthServiceProxy,
  ForgotPasswordDto,
  LoginDto,
  ResetPasswordDto,
} from '../../service-proxies/service-proxies';
import { ServiceProxyModule } from '../../service-proxies/service-proxy.module';
import { AuthService } from '../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ResetPasswordDialogComponent } from '../dialogs/reset-password-dialog/reset-password-dialog.component';
import { ForgotPasswordDialogComponent } from '../dialogs/forgot-password-dialog/forgot-password-dialog.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ServiceProxyModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginData: LoginDto = {} as LoginDto;
  isLoading = false;
  showPassword = false;
  errorMessage = '';
  userEmail: string = '';

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
      this.isLoading = true;
      this.errorMessage = '';

      try {
        this._authService.login(this.loginData).subscribe({
          next: (res) => {
            if (res.isError === 'false' && res.message) {
              this.authService.setToken(res.message);
              this.router.navigate(['/subjects']);
            } else {
              this.errorMessage = res.message || 'Login failed. Please try again.';
            }
          },
          error: (error) => {
            console.error('Login error:', error);
            this.errorMessage = 'An error occurred during login. Please try again.';
          },
          complete: () => {
            this.isLoading = false;
          }
        });
      } catch (error) {
        console.error('Login error:', error);
        this.errorMessage = 'An unexpected error occurred. Please try again.';
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
        this.userEmail = result;
        console.log('Forgot Password email:', result);

        this._authService
          .forgotPassword({ email: result } as ForgotPasswordDto)
          .subscribe((res) => {
            console.log('Reset password response:', res);
            if (res.isError === 'false') {
              this.openResetPasswordDialog();
            }
          });
      }
    });
  }

  openResetPasswordDialog() {
    const dialogRef = this.dialog.open(ResetPasswordDialogComponent, {
      width: '450px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Reset Password data:', result);
        const resetData = new ResetPasswordDto();
        resetData.email = this.userEmail;
        resetData.newPassword = result.newPassword;
        resetData.code = result.code;

        this._authService
          .resetPassword(resetData)
          .subscribe((res) => {
            console.log('Password reset response:', res);
            if (res.isError === 'false') {
              console.log('Password reset successful');
            } else {
              console.log('Password reset failed');
            }
          });
      }
    });
  }
}
