import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Appointment } from '../interfaces/appointment.interface';

declare var google: any;
declare var gapi: any;

export interface GoogleCalendarEvent {
    id?: string;
    summary: string;
    description?: string;
    start: {
        dateTime: string;
        timeZone: string;
    };
    end: {
        dateTime: string;
        timeZone: string;
    };
    attendees?: Array<{
        email: string;
        displayName?: string;
    }>;
}

export interface GoogleAuthResponse {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
    scope: string;
}

@Injectable({
    providedIn: 'root'
})
export class GoogleCalendarService {
    // Cliente ID público - se puede mostrar sin problemas de seguridad
    private readonly CLIENT_ID = '1092724997013-8llb98048kgdtm4chlqi602280a3j1vt.apps.googleusercontent.com';
    private readonly DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
    private readonly SCOPES = 'https://www.googleapis.com/auth/calendar';

    private isGapiInitialized = false;
    private isGisInitialized = false;
    private authSubject = new BehaviorSubject<boolean>(false);
    public isAuthenticated$ = this.authSubject.asObservable();

    // Nuevo BehaviorSubject para el estado de inicialización
    private initializationSubject = new BehaviorSubject<boolean>(false);
    public isInitialized$ = this.initializationSubject.asObservable();

    private tokenClient: any;
    private initializationPromise: Promise<void> | null = null;

    constructor(private http: HttpClient) {
        this.initializeGoogleAPIs();
    }

    /**
     * Inicializa las APIs de Google (GAPI y GIS)
     */
    private async initializeGoogleAPIs(): Promise<void> {
        // Evitar múltiples inicializaciones
        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise = this.performInitialization();
        return this.initializationPromise;
    }

    private async performInitialization(): Promise<void> {
        try {
            await this.loadGoogleScripts();
            await this.initializeGapi();
            await this.initializeGis();
            this.checkExistingAuth();
            this.initializationSubject.next(true);
        } catch (error) {
            console.error('Error inicializando Google APIs:', error);
            this.initializationSubject.next(false);
        }
    }

    /**
     * Método público para asegurar que la inicialización esté completa
     */
    async ensureInitialized(): Promise<void> {
        if (!this.initializationSubject.value) {
            await this.initializeGoogleAPIs();
        }
    }

    /**
     * Carga los scripts de Google si no están disponibles
     */
    private loadGoogleScripts(): Promise<void> {
        return new Promise((resolve, reject) => {
            // Verificar si ya están cargados
            if (typeof gapi !== 'undefined' && typeof google !== 'undefined') {
                resolve();
                return;
            }

            let scriptsLoaded = 0;
            const totalScripts = 2;

            const onScriptLoad = () => {
                scriptsLoaded++;
                if (scriptsLoaded === totalScripts) {
                    resolve();
                }
            };

            // Cargar GAPI
            if (typeof gapi === 'undefined') {
                const gapiScript = document.createElement('script');
                gapiScript.src = 'https://apis.google.com/js/api.js';
                gapiScript.onload = onScriptLoad;
                gapiScript.onerror = reject;
                document.head.appendChild(gapiScript);
            } else {
                onScriptLoad();
            }

            // Cargar Google Identity Services
            if (typeof google === 'undefined') {
                const gisScript = document.createElement('script');
                gisScript.src = 'https://accounts.google.com/gsi/client';
                gisScript.onload = onScriptLoad;
                gisScript.onerror = reject;
                document.head.appendChild(gisScript);
            } else {
                onScriptLoad();
            }
        });
    }

    /**
     * Inicializa GAPI
     */
    private async initializeGapi(): Promise<void> {
        return new Promise((resolve, reject) => {
            gapi.load('client', async () => {
                try {
                    await gapi.client.init({
                        discoveryDocs: [this.DISCOVERY_DOC],
                    });
                    this.isGapiInitialized = true;
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    /**
     * Inicializa Google Identity Services
     */
    private async initializeGis(): Promise<void> {
        return new Promise((resolve) => {
            this.tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: this.CLIENT_ID,
                scope: this.SCOPES,
                callback: (response: any) => {
                    if (response.error) {
                        console.error('Error en autenticación:', response.error);
                        return;
                    }

                    this.handleAuthSuccess(response);
                },
            });
            this.isGisInitialized = true;
            resolve();
        });
    }

    /**
     * Maneja el éxito de la autenticación
     */
    private handleAuthSuccess(response: any): void {
        const authData = {
            access_token: response.access_token,
            expires_in: response.expires_in || 3600,
            expires_at: new Date().getTime() + ((response.expires_in || 3600) * 1000),
            token_type: 'Bearer',
            scope: response.scope,
            timestamp: new Date().getTime()
        };

        // Guardar en localStorage
        localStorage.setItem('google_calendar_auth', JSON.stringify(authData));

        // Configurar el token en GAPI
        gapi.client.setToken(response);

        this.authSubject.next(true);
    }

    /**
     * Verifica si existe autenticación guardada y si es válida
     */
    private checkExistingAuth(): void {
        const savedAuth = localStorage.getItem('google_calendar_auth');
        if (savedAuth) {
            try {
                const authData = JSON.parse(savedAuth);
                if (this.isTokenValid(authData)) {
                    // Configurar el token en GAPI
                    gapi.client.setToken({
                        access_token: authData.access_token
                    });
                    this.authSubject.next(true);
                } else {
                    this.clearAuth();
                }
            } catch (error) {
                this.clearAuth();
            }
        }
    }

    /**
     * Verifica si el token es válido
     */
    private isTokenValid(authData: any): boolean {
        if (!authData.expires_at) return false;
        // Añadir un margen de 5 minutos antes de que expire
        const expirationWithMargin = authData.expires_at - (5 * 60 * 1000);
        return new Date().getTime() < expirationWithMargin;
    }

    /**
     * Obtiene el token de acceso guardado
     */
    private getStoredToken(): string | null {
        const savedAuth = localStorage.getItem('google_calendar_auth');
        if (savedAuth) {
            try {
                const authData = JSON.parse(savedAuth);
                if (this.isTokenValid(authData)) {
                    return authData.access_token;
                }
            } catch (error) {
                console.error('Error parsing stored auth:', error);
            }
        }
        return null;
    }

    /**
     * Inicia el proceso de autenticación con Google (abre popup)
     */
    async signIn(): Promise<boolean> {
        await this.ensureInitialized();

        return new Promise((resolve, reject) => {
            try {
                const originalCallback = this.tokenClient.callback;

                this.tokenClient.callback = (response: any) => {
                    if (response.error) {
                        console.error('Error en autenticación:', response.error);
                        reject(new Error(response.error));
                        return;
                    }

                    this.handleAuthSuccess(response);

                    this.tokenClient.callback = originalCallback;

                    resolve(true);
                };

                const existingToken = gapi.client.getToken();
                if (existingToken && this.isAuthenticated()) {
                    resolve(true);
                    return;
                }

                this.tokenClient.requestAccessToken({
                    prompt: 'consent'
                });

            } catch (error) {
                console.error('Error iniciando autenticación:', error);
                reject(error);
            }
        });
    }

    /**
     * Cierra sesión y limpia datos guardados
     */
    async signOut(): Promise<void> {
        const token = gapi.client.getToken();
        if (token) {
            // Revocar el token
            google.accounts.oauth2.revoke(token.access_token, () => {
                console.log('Token revocado');
            });

            // Limpiar token en GAPI
            gapi.client.setToken(null);
        }

        this.clearAuth();
    }

    /**
     * Limpia datos de autenticación
     */
    private clearAuth(): void {
        localStorage.removeItem('google_calendar_auth');
        this.authSubject.next(false);
    }

    /**
     * Verifica si el usuario está autenticado
     */
    isAuthenticated(): boolean {
        return !!this.getStoredToken();
    }

    /**
     * Obtiene información del usuario autenticado
     */
    getUserInfo(): any {
        const token = gapi.client.getToken();
        if (token) {
            // Para obtener info del usuario, necesitarías hacer una llamada adicional
            // Por ahora retornamos info básica del token
            return {
                email: 'Usuario autenticado',
                name: 'Google User',
                authenticated: true
            };
        }
        return null;
    }

    /**
     * Crea un evento en Google Calendar usando GAPI
     */
    async createCalendarEvent(eventData: GoogleCalendarEvent) {
        if (!this.isAuthenticated()) {
            throw new Error('No está autenticado con Google Calendar');
        }

        try {
            const request = gapi.client.calendar.events.insert({
                calendarId: 'primary',
                resource: eventData
            });

            // Aquí envolvemos el execute en una promesa
            const result = await new Promise<GoogleCalendarEvent>((resolve, reject) => {
                request.execute((response: any) => {
                    if (response && response.id) {
                        resolve(response);
                    } else {
                        reject(response); // Podrías agregar más validación aquí
                    }
                });
            });

            console.log(result)
            return result;
        } catch (error) {
            console.error('Error creando evento:', error);
            throw error;
        }
    }


    /**
     * Actualiza un evento en Google Calendar usando GAPI
     */
    async updateCalendarEvent(eventId: string, eventData: GoogleCalendarEvent): Promise<any> {
        if (!this.isAuthenticated()) {
            throw new Error('No está autenticado con Google Calendar');
        }

        try {
            const request = gapi.client.calendar.events.update({
                'calendarId': 'primary',
                'eventId': eventId,
                'resource': eventData
            });

            return await request.execute();
        } catch (error) {
            console.error('Error actualizando evento:', error);
            throw error;
        }
    }

    /**
     * Elimina un evento de Google Calendar usando GAPI
     */
    async deleteCalendarEvent(eventId: string): Promise<any> {
        if (!this.isAuthenticated()) {
            throw new Error('No está autenticado con Google Calendar');
        }

        try {
            const request = gapi.client.calendar.events.delete({
                'calendarId': 'primary',
                'eventId': eventId
            });

            return await request.execute();
        } catch (error) {
            console.error('Error eliminando evento:', error);
            throw error;
        }
    }

    /**
     * Obtiene la lista de eventos del calendario
     */
    async getCalendarEvents(timeMin?: string, timeMax?: string): Promise<any> {
        if (!this.isAuthenticated()) {
            throw new Error('No está autenticado con Google Calendar');
        }

        try {
            const request = gapi.client.calendar.events.list({
                'calendarId': 'primary',
                'timeMin': timeMin || new Date().toISOString(),
                'timeMax': timeMax,
                'showDeleted': false,
                'singleEvents': true,
                'orderBy': 'startTime'
            });

            return await request.execute();
        } catch (error) {
            console.error('Error obteniendo eventos:', error);
            throw error;
        }
    }

    /**
     * Convierte una cita a formato de evento de Google Calendar
     */
    convertAppointmentToGoogleEvent(appointment: Appointment): GoogleCalendarEvent {
        console.log(appointment)
        const startDate = new Date(appointment.scheduled_at!!);
        const endDate = new Date(startDate.getTime() + (appointment.service?.duration_minutes || 60) * 60000);

        return {
            summary: `Cita: ${appointment.service?.name || 'Servicio'}`,
            description: `Cliente: ${appointment.client?.name || 'N/A'}\nServicio: ${appointment.service?.name || 'N/A'}\nDuración: ${appointment.service?.duration_minutes || 60} minutos\n\nCreado desde la aplicación de citas`,
            start: {
                dateTime: startDate.toISOString(),
                timeZone: 'America/Bogota'
            },
            end: {
                dateTime: endDate.toISOString(),
                timeZone: 'America/Bogota'
            },
            attendees: appointment.client?.email ? [{
                email: appointment.client.email,
                displayName: appointment.client.name
            }] : []
        };
    }

    /**
     * Verifica el estado de la conexión
     */
    getConnectionStatus(): { isInitialized: boolean; isAuthenticated: boolean } {
        return {
            isInitialized: this.isGapiInitialized && this.isGisInitialized,
            isAuthenticated: this.isAuthenticated()
        };
    }
}