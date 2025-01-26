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

  constructor(private _examScheduleService: ExamScheduleServiceProxy) {}

  ngOnInit(): void {}

  addSubject() {
    this.exam.subjects.push({
      name: '',
      topics: [''],
      date: ''
    });
  }

  addTopic(subjectIndex: number) {
    this.exam.subjects[subjectIndex].topics.push('');
  }

  saveExam() {
    if (this.exam.subjects.length === 0) {
      console.error('No subjects added');
      return;
    }

    const examSubjectTimes = this.exam.subjects
      .filter(subject => subject.name && subject.date)
      .map(subject => {
        const dto = new ExamSubjectTimeDto();
        dto.subject = subject.name;
        dto.topicOrChapter = subject.topics.filter(t => t.trim() !== '');
        dto.examDateTime = DateTime.fromISO(subject.date);
        return dto;
      });

    if (examSubjectTimes.length === 0) {
      console.error('No valid subjects to save');
      return;
    }

    const request = new ExamScheduleRequest();
    request.dailyStudyHours = this.exam.dailyStudyHours;
    request.examDate = DateTime.fromISO(this.exam.examDate);
    request.examSubjectTimes = examSubjectTimes;

    console.log('Request payload:', JSON.stringify(request));

    this._examScheduleService.createExamSchedule(request).subscribe(
      (response) => {
        console.log('Exam saved successfully:', response);
      },
      (error) => {
        console.error('Error saving exam:', error);
      }
    );
  }
}
