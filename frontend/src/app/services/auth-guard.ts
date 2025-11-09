import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth';

// Auth Guard - Rota koruyucu
export const authGuard: CanActivateFn = (route, state) => {
  
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true; 
  } else {
    console.log('AuthGuard: Giremezsin! Önce /login\'e git.');
    return router.createUrlTree(['/login']);
  }
};
//amacı: giriş yapılmadan bazı sayfalara erişimi engellemek