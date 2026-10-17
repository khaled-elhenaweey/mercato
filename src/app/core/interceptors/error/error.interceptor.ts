import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../services/auth/auth-service';
import { NotificationService } from '../../services/notification/notification-service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.clearToken();
        notificationService.showError('Unauthorized access. Please log in again.');
        router.navigate(['/login']);
      } else if (error.status === 0) {
        notificationService.showError('issue with the network or CORS');
      } else if (error.status >= 500) {
        notificationService.showError('internal server error');
      } else {
        notificationService.showError(error.error?.message || 'something went wrong');
      }
      return throwError(() => error);
    }),
  );
};
