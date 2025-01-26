import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { ExamScheduleServiceProxy } from '../../../service-proxies/service-proxies';
import { ServiceProxyModule } from '../../../service-proxies/service-proxy.module';

@Component({
  selector: 'app-create-or-update-exam',
  standalone: true,
  imports: [CommonModule, FormsModule,ServiceProxyModule],
  templateUrl: './create-or-update-exam.component.html',
  styleUrl: './create-or-update-exam.component.css'
})
export class CreateOrUpdateExamComponent {
  exam = {
    examName: '',
    examDate: '',
    subjects: [] as any[]
  };

  constructor(private _examScheduleService:ExamScheduleServiceProxy) {
   
  }

  ngOnInit(): void {}

 


  addSubject() {
    this.exam.subjects.push({
      name: '',
      topics: ['']
    });
  }

  addTopic(subjectIndex: number) {
    this.exam.subjects[subjectIndex].topics.push('');
  }

  saveExam() {
    console.log(this.exam);

    // this._examScheduleService.createExamSchedule(this.exam).subscribe(() => {
    //   console.log('Exam saved successfully');
    // });

    // Implement your save logic here
  }
}
