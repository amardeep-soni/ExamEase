import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-task-preview-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Tasks for {{ data.date }}</h2>
    <mat-dialog-content>
      <div *ngFor="let task of data.tasks" class="task-preview-item">
        <h3>{{task.subject}}</h3>
        <p>Topic: {{task.topic}}</p>
        <p>Time: {{task.time}}</p>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="closeDialog()">Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .task-preview-item {
      padding: 10px;
      border-bottom: 1px solid #eee;
    }
    .task-preview-item:last-child {
      border-bottom: none;
    }
  `]
})
export class TaskPreviewDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TaskPreviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { date: string; tasks: any[] }
  ) {}

  closeDialog(): void {
    this.dialogRef.close();
  }
} 