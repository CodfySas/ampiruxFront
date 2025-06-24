import { Routes } from '@angular/router';
import { Login } from './pages/shared/login/login';
import { LoginGuard } from './guards/login.guard';
import { Home } from './pages/components/home/home';
import { AuthGuard } from './guards/auth.guard';
import { Dashboard } from './pages/components/dashboard/dashboard';
import { Products } from './pages/components/products/products';
import { ProductCategory } from './pages/components/product-category/product-category';
import { Services } from './pages/components/services/services';
import { Clients } from './pages/components/clients/clients';
import { Barbers } from './pages/components/barbers/barbers';
import { Sales } from './pages/components/sales/sales';
import { Appointments } from './pages/components/appointments/appointments';
import { Reserve } from './pages/shared/reserve/reserve';

export const routes: Routes = [
    { path: 'login', component: Login, canActivate: [LoginGuard] },
    { path: 'reserve/:id', component: Reserve },
    { path: '', component: Home, canActivate: [AuthGuard],
        children: [
            { path: '', component: Dashboard },
            { path: 'products', component: Products },
            { path: 'categories', component: ProductCategory },
            { path: 'services', component: Services },
            { path: 'clients', component: Clients },
            { path: 'employees', component: Barbers },
            { path: 'sales', component: Sales },
            { path: 'appointments', component: Appointments }
        ]
    },
    { path: '**', redirectTo: '' }
];
