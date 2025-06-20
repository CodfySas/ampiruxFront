import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material/material-module';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { filter, Subscription } from 'rxjs';
import { User } from '../../../interfaces/auth.interface';

@Component({
  selector: 'app-home',
  imports: [CommonModule, MaterialModule, RouterOutlet,      // Para <router-outlet>
    RouterLink,        // Para routerLink
    RouterLinkActive],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit, OnDestroy {

  currentUser: User | null = null;
  isLargeScreen = window.innerWidth >= 768; // lg: 1024px
  sidenavOpened = false;
  currentRoute = '';
  private routerSubscription: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.currentRoute = this.router.url;

    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
      });
  }

  ngOnDestroy() {
    this.routerSubscription.unsubscribe();
  }

  @HostListener('window:resize')
  onResize() {
    this.isLargeScreen = window.innerWidth >= 768;
    if (this.isLargeScreen) {
      this.sidenavOpened = true;
    }
  }

  toggleSidenav() {
    this.sidenavOpened = !this.sidenavOpened;
  }

  // Métodos para verificar si una sección está activa
  isGestionActive(): boolean {
    return this.currentRoute.includes('/appointments') ||
      this.currentRoute.includes('/clients') ||
      this.currentRoute.includes('/employees');
  }

  isCatalogoActive(): boolean {
    return this.currentRoute.includes('/services') ||
      this.currentRoute.includes('/products');
  }

  // Método para obtener clases CSS dinámicas
  getAccordionHeaderClass(section: string): string {
    const baseClass = '!p-2 !h-[40px]';

    if (section === 'gestion' && this.isGestionActive()) {
      return `${baseClass} !bg-purple-800`; // Color activo
    } else if (section === 'catalogo' && this.isCatalogoActive()) {
      return `${baseClass} !bg-purple-800`; // Color activo
    }

    return `${baseClass} !bg-primary`; // Color normal
  }

  getCurrentModule(): string {
    if (this.currentRoute === '/' || this.currentRoute === '') {
      return 'Inicio';
    } else if (this.isGestionActive()) {
      return 'Gestión';
    } else if (this.isCatalogoActive()) {
      return 'Catálogo';
    } else if (this.currentRoute.includes('/sales')) {
      return 'Ventas';
    } else if (this.currentRoute.includes('/cash')) {
      return 'Contaduría';
    } else if (this.currentRoute.includes('/reports')) {
      return 'Reportes';
    } else if (this.currentRoute.includes('/admin')) {
      return 'Administración';
    }

    return 'Desconocido';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
