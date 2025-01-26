import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-study-plan',
  imports: [CommonModule],
  templateUrl: './study-plan.component.html',
  styleUrl: './study-plan.component.css'
})
export class StudyPlanComponent {

  tasks = [
    { subject: 'Physic', date: '20 Jan 2025', time: '120 min', topic: 'Topic' },
    { subject: 'Math', date: '22 Jan 2025', time: '90 min', topic: 'Algebra' },
    { subject: 'Physic', date: '20 Jan 2025', time: '120 min', topic: 'Topic' },
    { subject: 'Math', date: '22 Jan 2025', time: '90 min', topic: 'Algebra' },
    { subject: 'Physic', date: '20 Jan 2025', time: '120 min', topic: 'Topic' },
    { subject: 'Math', date: '22 Jan 2025', time: '90 min', topic: 'Algebra' },
    { subject: 'Physic', date: '20 Jan 2025', time: '120 min', topic: 'Topic' },
    { subject: 'Math', date: '22 Jan 2025', time: '90 min', topic: 'Algebra' },
  ];

}
