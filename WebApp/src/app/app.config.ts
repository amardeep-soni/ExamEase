import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { API_BASE_URL } from '../service-proxies/service-proxies';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import Aura from '@primeng/themes/aura';
import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import { ServiceProxyModule } from '../service-proxies/service-proxy.module';
import { AuthInterceptor } from './services/auth.interceptor';

export function getRemoteServiceBaseUrl(): string {
  return 'https://examease.tryasp.net';
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideAnimationsAsync(),
    { provide: API_BASE_URL, useFactory: getRemoteServiceBaseUrl },
    provideHttpClient(
      withFetch(),
      withInterceptors([AuthInterceptor])
    ),
    BrowserModule,
    BrowserAnimationsModule,
    ServiceProxyModule,
    provideAnimationsAsync(),
  ]
};
