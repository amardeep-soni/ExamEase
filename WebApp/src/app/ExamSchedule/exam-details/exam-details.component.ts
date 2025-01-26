import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-exam-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exam-details.component.html',
  styleUrl: './exam-details.component.css'
})
export class ExamDetailsComponent {

exam = {
  examName: 'Final Exam',
  date: '2025-01-05',
  subjects: [
    {
      name: 'Physics',
      topics: ['Mechanics', 'Optics'],
      date: '2025-02-08'
    },
    {
      name: 'Chemistry',
      topics: ['Organic Chemistry', 'Inorganic Chemistry'],
      date: '2025-02-09'
    },
    {
      name: 'Mathematics',
      topics: ['Algebra', 'Calculus'],
      date: '2025-02-10'
    },
    {
      name: 'Biology',
      topics: ['Genetics', 'Ecology'],
      date: '2025-02-11'
    }
  ]
};
}
