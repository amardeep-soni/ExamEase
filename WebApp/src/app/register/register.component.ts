import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgForm,FormsModule } from '@angular/forms';

interface UserModel {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}
@Component({
  selector: 'app-register',
  imports: [CommonModule,FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
 
  user: UserModel = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false
  };

  onSubmit(form: NgForm) {
    if (form.valid) {
      console.log('Form submitted', this.user);
      // Implement your registration logic here
    }
  }
}