import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SubjectServiceProxy } from '../../service-proxies/service-proxies';
import { Subject } from '../../service-proxies/service-proxies';
import { CustomDeleteDialogComponent } from '../dialogs/custom-delete-dialog/custom-delete-dialog.component';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { getRemoteServiceBaseUrl } from '../app.config';

@Component({
  selector: 'app-subject-list',
  templateUrl: './subject-list.component.html',
  providers: [SubjectServiceProxy],
  imports: [ReactiveFormsModule, CommonModule, RouterModule, DatePipe]
})
export class SubjectListComponent implements OnInit {
  subjects: Subject[] = [];
  isLoading = false;
  isDeleting = false;

  constructor(
    private router: Router,
    private subjectService: SubjectServiceProxy,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadSubjects();
  }

  loadSubjects(): void {
    this.isLoading = true;
    this.subjectService.getAllSubject()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe(
        (result) => {
          this.subjects = result;
        },
        (error) => {
          console.error('Error loading subjects:', error);
        }
      );
  }

  addSubject(): void {
    this.router.navigate(['/subjects/create']);
  }

  editSubject(id: number): void {
    this.router.navigate(['/subjects/edit', id]);
  }

  deleteSubject(subject: Subject): void {
    const dialogRef = this.dialog.open(CustomDeleteDialogComponent, {
      width: '400px',
      data: { title: 'Delete Subject', message: `Are you sure you want to delete Subject ${subject.name}?` }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isDeleting = true;
        this.subjectService.delete(subject.id)
          .pipe(finalize(() => this.isDeleting = false))
          .subscribe(
            () => {
              this.loadSubjects();
            },
            error => {
              console.error('Error deleting subject:', error);
            }
          );
      }
    });
  }

  openPdf(fileName: string): void {
    const baseUrl = getRemoteServiceBaseUrl();
    window.open(`${baseUrl}/static/subject/${fileName}`, '_blank');
  }

  viewSubject(id: number): void {
    this.router.navigate(['/subjects/view', id]);
  }
}