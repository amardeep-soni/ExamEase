import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DateTime } from 'luxon';
import { finalize } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  ExamScheduleRequest,
  ExamScheduleServiceProxy,
  ExamSubjectTimeDto,
} from '../../../service-proxies/service-proxies';

interface Subject {
  name: string;
  date: string;
  topics: string[];
}

@Component({
  selector: 'app-create-or-update-exam',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-or-update-exam.component.html',
  styleUrl: './create-or-update-exam.component.css',
  providers: [ExamScheduleServiceProxy],
})
export class CreateOrUpdateExamComponent implements OnInit {
  exam = {
    examName: '',
    examDate: '',
    subjects: [] as Subject[],
    dailyStudyHours: 0,
  };

  isLoading = false;
  isEditMode = false;
  examId: number | null = null;

  constructor(
    private _examScheduleService: ExamScheduleServiceProxy,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id && !isNaN(Number(id))) {
      this.examId = Number(id);
      this.isEditMode = true;
      this.loadExamDetails(this.examId);
    }
  }

  loadExamDetails(id: number) {
    this.isLoading = true;
    this._examScheduleService.getExamSchedule(id)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (exam) => {
          this.exam = {
            examName: exam.examName || '',
            examDate: exam.examDate ? DateTime.fromISO(exam.examDate.toString()).toISODate() ?? '' : '',
            dailyStudyHours: exam.dailyStudyHours || 0,
            subjects: exam.examSubjectTimes?.map((subject) => ({
              name: subject.subject || '',
              date: subject.examDateTime ? DateTime.fromISO(subject.examDateTime.toString()).toISODate() ?? '' : '',
              topics: subject.topicOrChapter || [],
            })) || [],
          };
        },
        error: (error) => {
          console.error('Error loading exam:', error);
          this.snackBar.open('Failed to load exam details', 'Close', { duration: 3000 });
        }
      });
  }

  addSubject() {
    this.exam.subjects.push({ name: '', topics: [''], date: '' });
  }

  removeSubject(index: number) {
    this.exam.subjects.splice(index, 1);
  }

  addTopic(subjectIndex: number) {
    this.exam.subjects[subjectIndex].topics.push('');
  }

  removeTopic(subjectIndex: number, topicIndex: number) {
    this.exam.subjects[subjectIndex].topics.splice(topicIndex, 1);
  }

  validateForm(): boolean {
    if (!this.exam.examName || !this.exam.examDate || this.exam.dailyStudyHours <= 0) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return false;
    }

    if (this.exam.subjects.length === 0) {
      this.snackBar.open('Please add at least one subject', 'Close', { duration: 3000 });
      return false;
    }

    return true;
  }

  saveExam() {
    if (!this.validateForm()) return;

    const examSubjectTimes = this.exam.subjects
      .filter((subject) => subject.name && subject.date)
      .map((subject) => {
        const dto = new ExamSubjectTimeDto();
        dto.subject = subject.name;
        dto.topicOrChapter = subject.topics.filter((t) => t.trim() !== '');
        dto.examDateTime = DateTime.fromISO(subject.date);
        return dto;
      });

    const request = new ExamScheduleRequest();
    request.dailyStudyHours = this.exam.dailyStudyHours;
    request.examDate = DateTime.fromISO(this.exam.examDate);
    request.examSubjectTimes = examSubjectTimes;
    request.examName = this.exam.examName;

    this.isLoading = true;
    const operation = this.isEditMode
      ? this._examScheduleService.updateExamSchedule(this.examId!, request)
      : this._examScheduleService.createExamSchedule(request);

    operation
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: () => {
          const message = this.isEditMode ? 'Exam updated successfully!' : 'Exam created successfully!';
          this.snackBar.open(message, 'Close', { duration: 3000 });
          this.router.navigate(['/exam']);
        },
        error: (error) => {
          console.error('Error saving exam:', error);
          this.snackBar.open('Failed to save exam', 'Close', { duration: 3000 });
        }
      });
  }

  trackByIndex(index: number): number {
    return index;
  }

  isFormValid(): boolean {
    return !!(
      this.exam.examName &&
      this.exam.examDate &&
      this.exam.dailyStudyHours > 0 &&
      this.exam.subjects.length > 0 &&
      this.exam.subjects.every(subject => 
        subject.name && 
        subject.date && 
        subject.topics.some(topic => topic.trim() !== '')
      )
    );
  }
}
