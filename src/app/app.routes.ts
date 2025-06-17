import { Routes } from '@angular/router';
import { Login } from './pages/shared/login/login';
import { LoginGuard } from './guards/login.guard';
import { Home } from './pages/components/home/home';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: 'login', component: Login, canActivate: [LoginGuard] },
    { path: '', component: Home, canActivate: [AuthGuard] },
    { path: '**', redirectTo: '' }
];
