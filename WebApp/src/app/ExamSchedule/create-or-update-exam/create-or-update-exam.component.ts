import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-or-update-exam',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-or-update-exam.component.html',
  styleUrl: './create-or-update-exam.component.css'
})
export class CreateOrUpdateExamComponent {
  exam = {
    examName: '',
    examDate: '',
    subjects: [] as any[]
  };

  constructor(private fb: FormBuilder) {
   
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
    // Implement your save logic here
  }
}
