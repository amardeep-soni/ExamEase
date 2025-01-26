import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-study-plan',
  imports: [CommonModule],
  templateUrl: './study-plan.component.html',
  styleUrl: './study-plan.component.css'
})
export class StudyPlanComponent {
  currentIndex = 0;
  displayedTasks: any[] = [];
  tasksPerPage = 4;
  currentDate: Date = new Date('2025-01-20');
  isCalendarView: boolean = false;
  selectedDate: Date | null = null;

  // Calendar data
  weeks: Date[][] = [];

  tasks = [
    { subject: 'Physics', date: '20 Jan 2025', time: '120 min', topic: 'Mechanics' },
    { subject: 'Math', date: '20 Jan 2025', time: '90 min', topic: 'Calculus' },
    { subject: 'Chemistry', date: '20 Jan 2025', time: '60 min', topic: 'Organic Chemistry' },
    { subject: 'Biology', date: '20 Jan 2025', time: '45 min', topic: 'Cell Structure' },
    { subject: 'Math', date: '21 Jan 2025', time: '120 min', topic: 'Algebra' },
    { subject: 'Physics', date: '21 Jan 2025', time: '90 min', topic: 'Thermodynamics' },
    { subject: 'Chemistry', date: '21 Jan 2025', time: '120 min', topic: 'Chemical Bonds' },
    { subject: 'English', date: '21 Jan 2025', time: '60 min', topic: 'Grammar' },
    { subject: 'Physics', date: '22 Jan 2025', time: '90 min', topic: 'Electricity' },
    { subject: 'Math', date: '22 Jan 2025', time: '120 min', topic: 'Geometry' },
    { subject: 'Biology', date: '22 Jan 2025', time: '90 min', topic: 'Genetics' },
    { subject: 'Chemistry', date: '22 Jan 2025', time: '60 min', topic: 'Acids and Bases' }
  ];

  constructor() {
    this.updateDisplayedTasks();
    this.generateCalendarDays();
  }

  updateDisplayedTasks() {
    const currentDateStr = this.formatDate(this.currentDate);
    console.log('Current date:', currentDateStr); // Debug log

    this.displayedTasks = this.tasks.filter(task =>
      task.date === currentDateStr
    );
    console.log('Displayed tasks:', this.displayedTasks); // Debug log
  }

  private formatDate(date: Date): string {
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }

  goForward(): void {
    const nextDate = new Date(this.currentDate);
    nextDate.setDate(this.currentDate.getDate() + 1);

    const nextDateStr = this.formatDate(nextDate);
    console.log('Next date:', nextDateStr); // Debug log

    const hasNextDayTasks = this.tasks.some(task => task.date === nextDateStr);

    if (hasNextDayTasks) {
      this.currentDate = nextDate;
      this.updateDisplayedTasks();
    }
  }

  goBackward(): void {
    const prevDate = new Date(this.currentDate);
    prevDate.setDate(this.currentDate.getDate() - 1);

    const prevDateStr = this.formatDate(prevDate);
    console.log('Previous date:', prevDateStr); // Debug log

    const hasPrevDayTasks = this.tasks.some(task => task.date === prevDateStr);

    if (hasPrevDayTasks) {
      this.currentDate = prevDate;
      this.updateDisplayedTasks();
    }
  }

  getUniqueSubjects(): string[] {
    return [...new Set(this.tasks.map(task => task.subject))];
  }

  filterBySubject(subject: string) {
    if (subject) {
      this.displayedTasks = this.tasks.filter(task =>
        task.date === this.formatDate(this.currentDate) &&
        task.subject === subject
      );
    } else {
      this.updateDisplayedTasks();
    }
  }

  toggleView() {
    this.isCalendarView = !this.isCalendarView;
    if (!this.isCalendarView) {
      this.updateDisplayedTasks();
    }
  }

  generateCalendarDays() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    // Get first day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];

    // Add empty days until first day of month
    for (let i = 0; i < firstDay.getDay(); i++) {
      currentWeek.push(new Date(year, month - 1, lastDay.getDate() - firstDay.getDay() + i + 1));
    }

    // Add all days of month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(new Date(year, month, day));
    }

    // Fill remainder of last week with dates from next month
    while (currentWeek.length < 7) {
      const nextDate = new Date(year, month + 1, currentWeek.length - lastDay.getDate());
      currentWeek.push(nextDate);
    }
    weeks.push(currentWeek);

    this.weeks = weeks;
  }

  hasTasksForDate(date: Date): number {
    if (!date) return 0;
    const dateStr = this.formatDate(date);
    return this.tasks.filter(task => task.date === dateStr).length;
  }

  selectDate(date: Date) {
    if (!date) return;
    this.selectedDate = date;
    this.currentDate = date;
    this.isCalendarView = false;
    this.updateDisplayedTasks();
  }
}
