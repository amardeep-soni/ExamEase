import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ExamScheduleResponse, ExamScheduleServiceProxy } from '../../../service-proxies/service-proxies';
import { ServiceProxyModule } from '../../../service-proxies/service-proxy.module';
import { CustomDeleteDialogComponent } from '../../dialogs/custom-delete-dialog/custom-delete-dialog.component';
import { finalize } from 'rxjs/operators';

interface Exam {
  name: string;
  date: Date;
}

@Component({
  selector: 'app-exam-list',
  imports: [CommonModule, ServiceProxyModule],
  templateUrl: './exam-list.component.html',
  styleUrl: './exam-list.component.css',
})
export class ExamListComponent {
  exams: ExamScheduleResponse[] = [];
  isLoading = false;

  constructor(
    private router: Router,
    private _examScheduleService: ExamScheduleServiceProxy,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadExams();
  }

  loadExams(): void {
    this.isLoading = true;
    this._examScheduleService.getExamSchedules()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (exams) => {
          this.exams = exams;
        },
        error: (error) => {
          console.error('Error loading exams:', error);
        }
      });
  }

  addExam() {
    this.router.navigate(['/create-exam']);
  }

  viewExam(exam: any) {
    this.router.navigate(['/exam-details', exam.id]);
  }

  editExam(exam: any) {
    this.router.navigate(['/create-exam', exam.id]);

    // Logic to edit exam details
  }

  viewPlan(event: Event, exam: any) {
    event.stopPropagation(); // Stop the event from bubbling up
    this.router.navigate(['/studyplan', exam.id]);
    console.log(exam.id); 
  }

  deleteExam(exam: any) {
    const dialogRef = this.dialog.open(CustomDeleteDialogComponent, {
      width: '400px',
      data: { title: 'Delete Exam', message: `Are you sure you want to delete ${exam.name}?` }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Proceed with deletion
        this._examScheduleService.deleteExamSchedule(exam.id).subscribe(
          () => {
            console.log('Exam deleted successfully');
            // Refresh the exam list
            this.loadExams();
          },
          error => {
            console.error('Error deleting exam:', error);
          }
        );
      }
    });
  }
}
