import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { ServiceProxyModule } from '../service-proxies/service-proxy.module';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,HeaderComponent,ServiceProxyModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'WebApp';


}
