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

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'exam', component: ExamListComponent },
  { path: 'exam-details/:id', component: ExamDetailsComponent },
  { path: 'create-exam', component: CreateOrUpdateExamComponent },
  { path: 'create-exam/:id', component: CreateOrUpdateExamComponent },
  { path: 'studyplan', component: StudyPlanComponent },
  { path: 'studyplan/:id', component: StudyPlanComponent },
  { path: 'subjects', component: SubjectListComponent },
  { path: 'subjects/create', component: SubjectFormComponent },
  { path: 'subjects/edit/:id', component: SubjectFormComponent },
  { path: 'subjects/view/:id', component: SubjectViewComponent },
];
