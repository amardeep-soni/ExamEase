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
    subjects: [] as any[],
    dailyStudyHours: 0,
  };

  constructor(private _examScheduleService: ExamScheduleServiceProxy) {}

  ngOnInit(): void {}

  addSubject() {
    this.exam.subjects.push({
      name: '',
      topics: [''],
    });
  }

  addTopic(subjectIndex: number) {
    this.exam.subjects[subjectIndex].topics.push('');
  }

  saveExam() {


  }
}
