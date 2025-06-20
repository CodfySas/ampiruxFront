import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideNativeDateAdapter(),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        (req, next) => {
          const token = localStorage.getItem('ampirux_token');
          const userStr = localStorage.getItem('ampirux_user');
          const barbershopUuid: string | null = userStr ? JSON.parse(userStr).barbershop_uuid : null
          let headers: Record<string, string> = {};
          if (token) headers['Authorization'] = `Bearer ${token}`;
          if (barbershopUuid) headers['barbershop_uuid'] = barbershopUuid;

          req = req.clone({
            setHeaders: headers
          });

          return next(req);
        }
      ])
    )
  ]
};
