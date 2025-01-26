import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StudyPlanDto, StudyPlanServiceProxy, StudyTasksDto } from '../../service-proxies/service-proxies';
import { ServiceProxyModule } from '../../service-proxies/service-proxy.module';
import { MatDialog } from '@angular/material/dialog';
import { TaskPreviewDialogComponent } from './task-preview-dialog/task-preview-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';

interface Task {
  subject: string;
  date: string;
  time: string;
  topic: string;
}

@Component({
  selector: 'app-study-plan',
  imports: [CommonModule, ServiceProxyModule, MatDialogModule],
  templateUrl: './study-plan.component.html',
  styleUrl: './study-plan.component.css'
})
export class StudyPlanComponent {
  currentIndex = 0;
  displayedTasks: Task[] = [];
  tasksPerPage = 4;
  currentDate: Date = new Date();
  isCalendarView: boolean = false;
  selectedDate: Date | null = null;
  weeks: Date[][] = [];
  examId: number = 0;
  tasksData!: StudyPlanDto;
  tasks: Task[] = [];
  hoveredDate: Date | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private studyPlanService: StudyPlanServiceProxy,
    private dialog: MatDialog
  ) {
    this.generateCalendarDays();
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.examId = +params['id'];
      console.log('Exam ID:', this.examId);
      if (this.examId) {
        this.loadTasks();
      } else {
        console.error('Invalid route parameters');
      }
    });
  }

  loadTasks() {
    this.studyPlanService.getAllStudyPlansByExamScheduleId(this.examId).subscribe({
      next: (result) => {
        this.tasksData = result;
        console.log('Tasks loaded:', result);
        if (result.plans) {
          // Transform API data to match our Task interface
          this.tasks = result.plans.flatMap(plan => {
            if (plan.date && plan.tasks) {
              return plan.tasks.map(task => ({
                subject: task.subject || '',
                date: this.formatDate(new Date(plan.date || new Date())),
                time: `${task.timeAllocated} min`,
                topic: task.topic || ''
              }));
            }
            return [];
          });
          this.updateDisplayedTasks();
        }
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
      }
    });
  }

  updateDisplayedTasks() {
    const currentDateStr = this.formatDate(this.currentDate);
    console.log('Current date:', currentDateStr);

    this.displayedTasks = this.tasks.filter(task =>
      task.date === currentDateStr
    );
    console.log('Displayed tasks:', this.displayedTasks);
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

    // Fill remainder of last week
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
    const dateStr = this.formatDate(date);
    const tasksForDate = this.getTasksForDate(date);

    if (tasksForDate.length > 0) {
      this.dialog.open(TaskPreviewDialogComponent, {
        width: '400px',
        data: {
          date: dateStr,
          tasks: tasksForDate
        }
      });
    }
  }

  showTaskPreview(date: Date) {
    if (this.hasTasksForDate(date) > 0) {
      this.hoveredDate = date;
    }
  }

  hideTaskPreview() {
    this.hoveredDate = null;
  }

  getTasksForDate(date: Date): Task[] {
    if (!date) return [];
    const dateStr = this.formatDate(date);
    return this.tasks.filter(task => task.date === dateStr);
  }
}
