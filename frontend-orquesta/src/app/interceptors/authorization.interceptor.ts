import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { StorageService } from '../Modulo-seguridad/Services/storage.service';
import { UserContextService } from '../Modulo-seguridad/Services/user-context.service';

export const authorizationInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(StorageService);
  const userContext = inject(UserContextService);
  const router = inject(Router);

  const token = storage.getToken();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err) => {
      if (err.status === 401) {
        userContext.logout();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};
