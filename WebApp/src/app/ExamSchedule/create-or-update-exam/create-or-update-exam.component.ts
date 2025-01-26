import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import {
  ExamScheduleRequest,
  ExamScheduleServiceProxy,
  ExamSubjectTimeDto,
} from '../../../service-proxies/service-proxies';
import { ServiceProxyModule } from '../../../service-proxies/service-proxy.module';
import { DateTime } from 'luxon';
import { ActivatedRoute, Router } from '@angular/router';

interface Subject {
  name: string;
  date: string;
  topics: string[];
}

@Component({
  selector: 'app-create-or-update-exam',
  standalone: true,
  imports: [CommonModule, FormsModule, ServiceProxyModule],
  templateUrl: './create-or-update-exam.component.html',
  styleUrl: './create-or-update-exam.component.css',
})
export class CreateOrUpdateExamComponent {
  exam = {
    examName: '',
    examDate: '',
    subjects: [] as Subject[],
    dailyStudyHours: 0,
  };

  constructor(
    private _examScheduleService: ExamScheduleServiceProxy,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  // ngOnInit(): void {
  //   this.activatedRoute.paramMap.subscribe((params) => {
  //     const id = params.get('id');
  //     if (id) {
  //       this._examScheduleService.getExamSchedule(Number(id)).subscribe((exam) => {
  //         console.log('Raw API response:', exam); // For debugging
          
  //         // this.exam = {
  //         //   examName: exam.email || '', // Changed from examName to email
  //         //   // examDate: exam.examDate
  //         //   //   ? DateTime.fromISO(exam.examDate).toISODate()
  //         //   //   : '',
  //         //   dailyStudyHours: exam.dailyStudyHours || 0,
  //         //   // subjects: exam.examSubjectTimes?.map((subject) => ({
  //         //   //   name: subject.subject || '',
  //         //   //   date: subject.examDateTime
  //         //   //     ? DateTime.fromISO(subject.examDateTime).toISODate()
  //         //   //     : '',
  //         //   //   topics: subject.topicOrChapter || [],
  //         //   // })) || [],
  //         // };
          
  //         console.log('Mapped exam object:', this.exam); // For debugging
  //       });
  //     }
  //   });
  // }

  addSubject() {
    this.exam.subjects.push({ name: '', topics: [''], date: '' });
  }

  addTopic(subjectIndex: number) {
    this.exam.subjects[subjectIndex].topics.push('');
  }

  saveExam() {
    if (!this.exam.examName || !this.exam.examDate || this.exam.dailyStudyHours <= 0) {
      console.error('Exam details are incomplete');
      alert('Please fill in all required fields.');
      return;
    }

    const examSubjectTimes = this.exam.subjects
      .filter((subject) => subject.name && subject.date)
      .map((subject) => {
        const dto = new ExamSubjectTimeDto();
        dto.subject = subject.name;
        dto.topicOrChapter = subject.topics.filter((t) => t.trim() !== '');
        dto.examDateTime = DateTime.fromISO(subject.date);

        return dto;
      });

    if (examSubjectTimes.length === 0) {
      console.error('No valid subjects to save');
      alert('Please add at least one valid subject.');
      return;
    }

    const request = new ExamScheduleRequest();
    request.dailyStudyHours = this.exam.dailyStudyHours;
    request.examDate = DateTime.fromISO(this.exam.examDate);
    request.examSubjectTimes = examSubjectTimes;
    request.examName = this.exam.examName;


    this._examScheduleService.createExamSchedule(request).subscribe(
      (response) => {
        alert('Exam saved successfully!');
        this.router.navigate(['/exam']);
        console.log('Exam saved:', response);
      },
      (error) => {
        alert('Failed to save the exam.');
        console.error('Error saving exam:', error);
      }
    );
  }
}
