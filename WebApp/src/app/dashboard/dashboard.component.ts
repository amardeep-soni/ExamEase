import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserServiceProxy } from '../../service-proxies/service-proxies';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { ServiceProxyModule } from '../../service-proxies/service-proxy.module';



@Component({
  selector: 'app-dashboard',
  imports: [CommonModule,ServiceProxyModule],
  templateUrl: './dashboard.component.html',              
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  
  constructor(private user: UserServiceProxy, private authService: AuthService) {}

  
  ngOnInit(): void {
    console.log('App component initialized');
    this.user.profileGet().subscribe({
      next: (res) => {
        console.log('Profile:', res);
    console.log('App component middleware:', res);

      },
      error: (err) => {
        console.error('Profile error:', err);
      },
    });


    console.log('App component end');
  }

}
