import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { StudyPlanDto, StudyPlanServiceProxy, StudyTasksDto } from '../../service-proxies/service-proxies';
import { ServiceProxyModule } from '../../service-proxies/service-proxy.module';
import { MatDialog } from '@angular/material/dialog';
import { TaskPreviewDialogComponent } from './task-preview-dialog/task-preview-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { finalize } from 'rxjs/operators';

interface Task {
  subject: string;
  date: string;
  time: string;
  topic: string;
}

@Component({
  selector: 'app-study-plan',
  imports: [CommonModule, ServiceProxyModule, MatDialogModule, RouterModule],
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
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  isLoading = false;

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
    this.isLoading = true;
    this.studyPlanService.getAllStudyPlansByExamScheduleId(this.examId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
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

  formatDate(date: Date): string {
    if (!date) return '';
    return new DatePipe('en-US').transform(date, 'dd MMM yyyy') || '';
  }

  goForward() {
    const nextDate = new Date(this.currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    this.currentDate = nextDate;
    this.updateDisplayedTasks();
  }

  goBackward() {
    const prevDate = new Date(this.currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    this.currentDate = prevDate;
    this.updateDisplayedTasks();
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
    
    // Get first day of the month
    const firstDay = new Date(year, month, 1);
    // Get last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Calculate days from previous month
    const daysFromPrevMonth = firstDay.getDay();
    const daysFromNextMonth = 6 - lastDay.getDay();
    
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];
    
    // Add days from previous month
    const prevMonth = new Date(year, month - 1);
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = prevMonthLastDay - daysFromPrevMonth + 1; i <= prevMonthLastDay; i++) {
      currentWeek.push(new Date(prevMonth.getFullYear(), prevMonth.getMonth(), i));
    }
    
    // Add days from current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(new Date(year, month, day));
    }
    
    // Add days from next month
    const nextMonth = new Date(year, month + 1);
    for (let day = 1; day <= daysFromNextMonth; day++) {
      currentWeek.push(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day));
    }
    
    // Push the last week if it exists
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        const nextDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), currentWeek.length);
        currentWeek.push(nextDay);
      }
      weeks.push(currentWeek);
    }

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

  setView(isCalendar: boolean) {
    this.isCalendarView = isCalendar;
    if (!isCalendar) {
      this.updateDisplayedTasks();
    }
  }

  previousMonth() {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() - 1,
      1
    );
    this.generateCalendarDays();
  }

  nextMonth() {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      1
    );
    this.generateCalendarDays();
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  isSameMonth(date: Date): boolean {
    return date.getMonth() === this.currentDate.getMonth() &&
           date.getFullYear() === this.currentDate.getFullYear();
  }

  isSelectedDate(date: Date): boolean {
    return this.selectedDate?.getTime() === date.getTime();
  }
}
