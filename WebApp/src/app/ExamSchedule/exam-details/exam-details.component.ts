import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ExamScheduleResponse, ExamScheduleServiceProxy } from '../../../service-proxies/service-proxies';
import { ServiceProxyModule } from '../../../service-proxies/service-proxy.module';

@Component({
  selector: 'app-exam-details',
  standalone: true,
  imports: [CommonModule, ServiceProxyModule,DatePipe],
  templateUrl: './exam-details.component.html',
  styleUrl: './exam-details.component.css'
})
export class ExamDetailsComponent {

  examData:ExamScheduleResponse | undefined
  constructor(private route: ActivatedRoute, private _examScheduleService: ExamScheduleServiceProxy,) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      console.log('Exam ID from URL:', id);
      this._examScheduleService.getExamSchedule(Number(id)).subscribe((exam) => {
        console.log('Raw API response:', exam); // For debugging
        this.examData = exam;
      
      });
    });
  }

}
