import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get the token from AuthService
    const token = this.authService.getToken();

    if (token) {
      // Clone the request and add the Authorization header
      const clonedRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      // Pass the cloned request to the next handler
      return next.handle(clonedRequest);
    }

    // If no token is present, pass the original request
    return next.handle(req);
  }
}
