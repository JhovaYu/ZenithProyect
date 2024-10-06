import { inject} from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpHandlerFn } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../app/services/auth.service';
import { Router } from '@angular/router';


export const authInterceptor: HttpInterceptorFn = (request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  

  
    if (request.url.includes('/api/login')) {
      return next(request);
    }
    
    const token = authService.getToken();
    console.log('Token en interceptor:', token);

    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Request con token:', request);
    }

    return next(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          authService.logout();
          router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  };
