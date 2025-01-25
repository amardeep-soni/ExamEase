import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';   
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ExamListComponent } from './ExamSchedule/exam-list/exam-list.component';
import { CreateOrUpdateExamComponent } from './ExamSchedule/create-or-update-exam/create-or-update-exam.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'exam', component: ExamListComponent },
  { path: 'exam-details/:id', component: ExamListComponent },
  { path: 'create-exam', component: CreateOrUpdateExamComponent },


];
