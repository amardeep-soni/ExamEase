import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';   
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ExamListComponent } from './ExamSchedule/exam-list/exam-list.component';
import { CreateOrUpdateExamComponent } from './ExamSchedule/create-or-update-exam/create-or-update-exam.component';
import { ExamDetailsComponent } from './ExamSchedule/exam-details/exam-details.component';
import { StudyPlanComponent } from './study-plan/study-plan.component';
import { SubjectListComponent } from './subject/subject-list.component';
import { SubjectFormComponent } from './subject/subject-form.component';
import { SubjectViewComponent } from './subject/subject-view.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'exam', component: ExamListComponent, canActivate: [authGuard] },
  { path: 'exam-details/:id', component: ExamDetailsComponent, canActivate: [authGuard] },
  { path: 'create-exam', component: CreateOrUpdateExamComponent, canActivate: [authGuard] },
  { path: 'create-exam/:id', component: CreateOrUpdateExamComponent, canActivate: [authGuard] },
  { path: 'studyplan', component: StudyPlanComponent, canActivate: [authGuard] },
  { path: 'studyplan/:id', component: StudyPlanComponent, canActivate: [authGuard] },
  { path: 'subjects', component: SubjectListComponent, canActivate: [authGuard] },
  { path: 'subjects/create', component: SubjectFormComponent, canActivate: [authGuard] },
  { path: 'subjects/edit/:id', component: SubjectFormComponent, canActivate: [authGuard] },
  { path: 'subjects/view/:id', component: SubjectViewComponent, canActivate: [authGuard] },
];
