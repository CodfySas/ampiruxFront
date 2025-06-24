import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MaterialModule } from '../../../../material/material-module';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../../services/appointment.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Appointment } from '../../../../interfaces/appointment.interface';
import { Client } from '../../../../interfaces/client.interface';
import { ClientService } from '../../../../services/client.service';
import { ServiceService } from '../../../../services/service.service';
import { Service } from '../../../../interfaces/service.interface';
import { FormsModule } from '@angular/forms';
import { ClientForm } from '../client-form/client-form';
import Swal from 'sweetalert2';
import { GoogleCalendarEvent, GoogleCalendarService } from '../../../../services/google-calendar.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-appointment-form',
  imports: [CommonModule, MaterialModule, FormsModule],
  templateUrl: './appointment-form.html',
  styleUrl: './appointment-form.scss'
})
export class AppointmentForm implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  isLoading = true;
  new: Appointment = {
  }

  clients: Client[] = []
  searchDni: string = ''
  clientResult: Client | null = null
  filteredClients: Client[] = []

  services: Service[] = []
  searchService: string = ''
  serviceResult: Service | null = null
  filteredServices: Service[] = []

  date: string = '';
  hour: string = '';

  isGoogleCalendarAuthenticated = false;
  syncWithGoogleCalendar = true;
  googleUserInfo: any = null;
  googleConnectionStatus: any = null;
  checking = true;

  constructor(
    private appSvc: AppointmentService,
    private dialogRef: MatDialogRef<AppointmentForm>,
    private clientSvc: ClientService,
    private serviceSvc: ServiceService,
    private googleCalendarSvc: GoogleCalendarService,
    @Inject(MAT_DIALOG_DATA) public data: Appointment | null,
    private dialog: MatDialog // Para abrir el diálogo de cliente
  ) { }

  ngOnInit(): void {
    this.checking = true;
    this.loadInitialData();
    this.initializeForm();
    this.checkGoogleCalendarAuth();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadInitialData(): void {
    this.clientSvc.getClients('-', 0, 999999).subscribe((p) => {
      this.clients = p.content
      this.filteredClients = p.content
    });
    this.serviceSvc.getServices('-', 0, 999999).subscribe((p) => {
      this.services = p.content
      this.filteredServices = p.content
    });
    this.isLoading = false;
  }

  private initializeForm(): void {
    if (this.data) {
      // Si estamos editando, cargar los datos existentes
      this.new = { ...this.data };

      console.log(this.data.scheduled_at)
      this.hour = this.data.scheduled_at?.substring(11, 16) ?? ''

      if (this.new.client) {
        this.clientResult = this.new.client;
        if (this.clientResult) {
          this.searchDni = this.new.client.uuid || '';
        }
      }

      if (this.new.service) {
        this.serviceResult = this.new.service;
        if (this.serviceResult) {
          this.searchService = this.new.service.name || '';
        }
      }
    }
  }


  private checkGoogleCalendarAuth(): void {
    this.checking = true;

    // Primero esperar a que la inicialización esté completa
    this.googleCalendarSvc.isInitialized$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (isInitialized) => {
          if (isInitialized) {
            // Una vez inicializado, verificar el estado de autenticación
            this.googleCalendarSvc.isAuthenticated$
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (isAuth) => {
                  this.isGoogleCalendarAuthenticated = isAuth;
                  this.googleConnectionStatus = this.googleCalendarSvc.getConnectionStatus();

                  if (isAuth) {
                    this.googleUserInfo = this.googleCalendarSvc.getUserInfo();
                    this.syncWithGoogleCalendar = true;
                  } else {
                    this.googleUserInfo = null;
                    this.syncWithGoogleCalendar = false;
                  }

                  // Terminar el estado de checking
                  this.checking = false;
                },
                error: (error) => {
                  console.error('Error verificando autenticación de Google Calendar:', error);
                  this.checking = false;
                  this.isGoogleCalendarAuthenticated = false;
                  this.syncWithGoogleCalendar = false;
                }
              });
          }
        },
        error: (error) => {
          console.error('Error en la inicialización de Google Calendar:', error);
          this.checking = false;
          this.isGoogleCalendarAuthenticated = false;
          this.syncWithGoogleCalendar = false;
        }
      });
  }

  async signInToGoogleCalendar(): Promise<void> {
    try {
      Swal.fire({
        title: 'Conectando con Google Calendar',
        text: 'Se abrirá una ventana para iniciar sesión...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      await this.googleCalendarSvc.signIn();

      Swal.fire({
        icon: 'success',
        title: '¡Conectado!',
        text: 'Te has conectado exitosamente con Google Calendar',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error al conectar con Google Calendar:', error);

      let errorMessage = 'No se pudo conectar con Google Calendar. Por favor, intenta de nuevo.';

      if (error instanceof Error) {
        if (error.message.includes('popup_blocked')) {
          errorMessage = 'El navegador bloqueó la ventana emergente. Por favor, permite ventanas emergentes para este sitio.';
        } else if (error.message.includes('access_denied')) {
          errorMessage = 'Acceso denegado. Es necesario dar permisos para acceder a Google Calendar.';
        }
      }

      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: errorMessage,
        confirmButtonText: 'Entendido'
      });
    }
  }

  async signOutFromGoogleCalendar(): Promise<void> {
    try {
      await this.googleCalendarSvc.signOut();
      this.syncWithGoogleCalendar = false;

      Swal.fire({
        icon: 'info',
        title: 'Desconectado',
        text: 'Te has desconectado de Google Calendar',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error al desconectar:', error);
      Swal.fire({
        icon: 'warning',
        title: 'Error',
        text: 'Hubo un problema al desconectar. Por favor, intenta de nuevo.',
      });
    }
  }

  private async syncAppointmentWithGoogleCalendar(appointment: Appointment, edit: boolean) {
    if (!this.isGoogleCalendarAuthenticated) {
      return null;
    }

    try {
      if (this.serviceResult) {
        appointment.service = this.serviceResult;
      }
      if (this.clientResult) {
        appointment.client = this.clientResult;
      }

      const googleEvent = this.googleCalendarSvc.convertAppointmentToGoogleEvent(appointment);
      var result: GoogleCalendarEvent;
      if (edit && appointment.google_calendar_event_id) {
        result = await this.googleCalendarSvc.updateCalendarEvent(appointment.google_calendar_event_id, googleEvent)
      } else {
        result = await this.googleCalendarSvc.createCalendarEvent(googleEvent);

      }

      console.log('Evento creado en Google Calendar:', result);

      Swal.fire({
        icon: 'success',
        title: 'Sincronizado',
        text: 'La cita se ha sincronizado con Google Calendar',
        timer: 2000,
        showConfirmButton: false
      });
      return result;
    } catch (error) {
      console.error('Error al sincronizar con Google Calendar:', error);

      // Determinar el tipo de error
      let errorMessage = 'La cita se creó correctamente, pero no se pudo sincronizar con Google Calendar';

      if (error instanceof Error) {
        if (error.message.includes('quota')) {
          errorMessage = 'Se ha alcanzado el límite de uso de Google Calendar. Intenta más tarde.';
        } else if (error.message.includes('forbidden')) {
          errorMessage = 'No tienes permisos para crear eventos en Google Calendar.';
        }
      }

      Swal.fire({
        icon: 'warning',
        title: 'Error de sincronización',
        text: errorMessage,
      });
      return null
    }
  }

  isExistingClient(): boolean {
    if (!this.searchDni || this.searchDni == '') return false;
    return this.clients.some(client =>
      client.dni === this.searchDni?.trim() ||
      client.name?.toLowerCase() === (this.searchDni ?? '').toLowerCase().trim()
    );
  }

  formatDate(date: string): string {
    if (date == '') return '';
    const newdate = new Date(date);
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    return newdate.toLocaleDateString('es-CO', options).toLowerCase();
  }

  onSearchDni(): void {
    this.clientResult = null;

    if (!this.searchDni || this.searchDni.trim() === '') {
      return;
    }

    if (this.searchDni.length >= 5) {
      const foundClient = this.clients.find(client =>
        client.dni === this.searchDni.trim()
      );

      if (foundClient) {
        this.clientResult = foundClient;
        this.new.client_uuid = foundClient.uuid;
      }
    }

    const filterValue = this.searchDni.toLowerCase().trim();
    this.filteredClients = this.clients.filter(client =>
      client.name?.toLowerCase().includes(filterValue) ||
      client.dni?.includes(filterValue) ||
      client.email?.toLowerCase().includes(filterValue)
    ).slice(0, 10);
  }

  onSearchService(): void {
    this.serviceResult = null;

    if (!this.searchService || this.searchService.trim() === '') {
      return;
    }

    if (this.searchService.length >= 5) {
      const foundService = this.services.find(service =>
        service.name === this.searchService.trim()
      );

      if (foundService) {
        this.serviceResult = foundService;
        this.new.service_uuid = foundService.uuid;
      }
    }

    const filterValue = this.searchService.toLowerCase().trim();
    this.filteredServices = this.services.filter(service =>
      service.name?.toLowerCase().includes(filterValue) ||
      service.description?.includes(filterValue)
    ).slice(0, 10);
  }

  setClient(client: Client) {
    this.clientResult = client;
    this.new.client_uuid = client.uuid;
  }

  unsetClient() {
    this.clientResult = null;
    this.new.client_uuid = undefined;
  }

  setService(service: Service) {
    this.serviceResult = service;
    this.new.service_uuid = service.uuid;
  }

  unsetService() {
    this.serviceResult = null;
    this.new.service_uuid = undefined;
  }

  openClientForm(): void {
    const dialogRef = this.dialog.open(ClientForm, {
      width: '600px',
      data: { dni: this.searchDni.trim() }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.uuid) {
        this.handleNewClientCreated(result);
      }
    });
  }

  private handleNewClientCreated(newClient: Client): void {
    this.clients.push(newClient);
    this.new.client_uuid = newClient.uuid;
    this.clientResult = newClient;
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} minutos`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    let result = `${hours} hora${hours > 1 ? 's' : ''}`;

    if (remainingMinutes > 0) {
      result += ` ${remainingMinutes} minutos`;
    }

    return result;
  }

  async onSave() {
    this.isLoading = true;
    const date = this.new.scheduled_at?.substring(0, 10);
    const datetime = `${date}T${this.hour}:00`;
    this.new.scheduled_at = datetime;

    if (!this.hour || this.hour == "") {
      Swal.fire({
        icon: 'error',
        title: 'Faltan campos',
        text: 'Porfavor Rellene todos los campos marcados con (*)',
      });
      this.isLoading = false;
      return;
    }

    if (this.data?.uuid) {
      this.appSvc.updateAppointment(this.data!!.uuid!, this.new).subscribe({
        next: async (res) => {
          await this.syncAppointmentWithGoogleCalendar(res, true);
          Swal.fire({
            icon: 'success',
            title: 'Cita editada!',
            text: 'La cita se ha editado exitosamente',
          });
          this.onClose()
          this.isLoading = false;
          return;
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'No se ha podido editar la cita',
            text: err?.error?.message || 'Porfavor verifique su conexión a internet o intentelo más tarde',
          });
          this.isLoading = false;
          return;
        }
      })
    } else {
      this.new.status = "CONFIRMED"
      const result = await this.syncAppointmentWithGoogleCalendar(this.new, false);
      this.new.google_calendar_event_id = result?.id
      this.appSvc.createAppointment(this.new).subscribe({
        next: async (res) => {

          Swal.fire({
            icon: 'success',
            title: 'Cita creada!',
            text: 'La cita se ha creado exitosamente',
          });
          this.dialogRef.close(res);
          this.isLoading = false;
          return;
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'No se ha podido crear la cita',
            text: err?.error?.message || 'Porfavor verifique su conexión a internet o intentelo más tarde',
          });
          this.isLoading = false;
          return;
        }
      })
    }
  }

  onClose() {
    this.dialogRef.close()
  }
}
