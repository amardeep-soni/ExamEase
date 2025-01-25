import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
interface Exam {
  name: string;
  date: Date;
}

@Component({
  selector: 'app-exam-list',
  imports: [CommonModule],
  templateUrl: './exam-list.component.html',
  styleUrl: './exam-list.component.css',
})
export class ExamListComponent {
  exams: Exam[] = [
    { name: 'Math Exam', date: new Date('2023-11-01') },
    { name: 'Science Exam', date: new Date('2023-11-15') },
    { name: 'History Exam', date: new Date('2023-12-01') },
  ];

  constructor( private router:Router) {}  
  addExam() {
    this.router.navigate(['/create-exam']);
  }

  viewExam(exam: Exam) {
    // Logic to view exam details
  }

  editExam(exam: Exam) {
    // Logic to edit exam details
  }

  deleteExam(exam: Exam) {
    // Logic to delete an exam
  }
}
