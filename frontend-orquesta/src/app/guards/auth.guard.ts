import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserContextService } from '../Modulo-seguridad/Services/user-context.service';

export const authGuard: CanActivateFn = (route, state) => {
  const userContext = inject(UserContextService);
  const router = inject(Router);

  if (userContext.estaAutenticado) return true;

  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
