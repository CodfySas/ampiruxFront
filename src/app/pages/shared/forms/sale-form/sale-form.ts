import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { Sale, SaleProduct, SaleServiceProductDto } from '../../../../interfaces/sale.interface';
import { SaleService } from '../../../../services/sale.service';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../../material/material-module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Product } from '../../../../interfaces/product.interface';
import { ProductService } from '../../../../services/product.service';
import { Barber } from '../../../../interfaces/barber.interface';
import { Client } from '../../../../interfaces/client.interface';
import { Service } from '../../../../interfaces/service.interface';
import { ClientService } from '../../../../services/client.service';
import { BarberService } from '../../../../services/barber.service';
import { ServiceService } from '../../../../services/service.service';
import { ClientForm } from '../client-form/client-form';
import { BarberForm } from '../barber-form/barber-form';
import { SharedModule } from '../../../utils/currency-mask.directive';
// Asegúrate de importar tu ClientForm
// import { ClientForm } from '../../../../path/to/client-form.component';

@Component({
  selector: 'app-sale-form',
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, FormsModule, SharedModule],
  templateUrl: './sale-form.html',
  styleUrl: './sale-form.scss'
})
export class SaleForm {
  new: Sale = {
    sale_products: [] // Inicializar como array vacío
  }

  clients: Client[] = []
  searchDni: string = ''
  clientResult: Client | null = null
  filteredClients: Client[] = []

  barbers: Barber[] = []
  searchBarber: string = ''
  barberResult: Barber | null = null
  filteredBarber: Barber[] = []

  services: Service[] = []
  searchService: string = ''
  filteredServices: Service[] = []

  products: Product[] = []
  filteredProducts: Product[] = []
  searchTerm: string = ''
  isLoading = true;

  constructor(
    private saleService: SaleService,
    private dialogRef: MatDialogRef<SaleForm>,
    @Inject(MAT_DIALOG_DATA) public data: Sale | null,
    private productSvc: ProductService,
    private clientSvc: ClientService,
    private barberSvc: BarberService,
    private serviceSvc: ServiceService,
    private dialog: MatDialog // Para abrir el diálogo de cliente
  ) { }

  ngOnInit(): void {
    this.loadInitialData();
    this.initializeForm();
  }

  private loadInitialData(): void {
    this.productSvc.getProducts('-', 0, 999999).subscribe((p) => this.products = p.content);
    this.clientSvc.getClients('-', 0, 999999).subscribe((p) => {
      this.clients = p.content
      this.filteredClients = p.content
    });
    this.serviceSvc.getServices('-', 0, 999999).subscribe((p) => {
      this.services = p.content
      this.filteredServices = p.content
    });
    this.barberSvc.getBarbers('-', 0, 999999).subscribe((p) => {
      this.barbers = p.content;
      this.filteredBarber = p.content;
    });
    this.isLoading = false;
  }

  private initializeForm(): void {
    if (this.data) {
      // Si estamos editando, cargar los datos existentes
      this.new = { ...this.data };
      if (!this.new.sale_products) {
        this.new.sale_products = [];
      }

      if (this.new.client_uuid) {
        this.clientResult = this.clients.find(c => c.uuid === this.new.client_uuid) || null;
        if (this.clientResult) {
          this.searchDni = this.clientResult.uuid || '';
        }
      }

      if (this.new.barber_uuid) {
        this.barberResult = this.barbers.find(c => c.uuid === this.new.barber_uuid) || null;
        if (this.barberResult) {
          this.searchBarber = this.barberResult.uuid || '';
        }
      }
    } else {
      this.new = {
        sale_products: []
      };
    }
  }

  isExistingClient(): boolean {
    if (!this.searchDni || this.searchDni == '') return false;
    return this.clients.some(client =>
      client.dni === this.searchDni?.trim() ||
      client.name?.toLowerCase() === (this.searchDni ?? '').toLowerCase().trim()
    );
  }

  isExistingBarber(): boolean {
    if (!this.searchBarber || this.searchBarber == '') return false;
    return this.barbers.some(barber =>
      barber.dni === this.searchBarber?.trim() ||
      barber.name?.toLowerCase() === (this.searchBarber ?? '').toLowerCase().trim()
    );
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

  onSearchBarber(): void {
    this.barberResult = null;

    if (!this.searchBarber || this.searchBarber.trim() === '') {
      return;
    }

    if (this.searchBarber.length >= 5) {
      const foundBarber = this.barbers.find(barber =>
        barber.dni === this.searchBarber.trim()
      );

      if (foundBarber) {
        this.barberResult = foundBarber;
        this.new.barber_uuid = foundBarber.uuid;
      }
    }

    const filterValue = this.searchBarber.toLowerCase().trim();
    this.filteredBarber = this.barbers.filter(barber =>
      barber.name?.toLowerCase().includes(filterValue) ||
      barber.dni?.includes(filterValue) ||
      barber.email?.toLowerCase().includes(filterValue)
    ).slice(0, 10);
  }

  onSearchService(): void {

    if (!this.searchService || this.searchService.trim() === '') {
      return;
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

  setBarber(barber: Barber) {
    this.barberResult = barber;
    this.new.barber_uuid = barber.uuid;
  }

  unsetBarber() {
    this.barberResult = null;
    this.new.barber_uuid = undefined;
  }

  formatSalary(value: any): string {
    if (value == null) return '$0';
    return '$' + value.toLocaleString('es-CO');
  }

  addService(service: Service) {
    this.searchService = ''
    const used: SaleServiceProductDto[] = []
    if (service.default_products) {
      for (const dp of service.default_products) {
        used.push({
          product: dp.product,
          product_uuid: dp.product_uuid,
          quantity: dp.quantity,
          unit: dp.product?.unit,
          cost_type: dp.cost_type,
        })
      }
    }
    const newA = this.new.services || []
    newA.push({
      service_uuid: service.uuid,
      price: service.price,
      is_courtesy: false,
      commission_rate: this.barberResult?.commission_rate,
      barber_uuid: this.barberResult?.uuid,
      used_products: used,
      service: service,
    })
    this.new.services = newA;
  }


  deleteService(i: number) {
    this.new.services?.splice(i, 1)
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

  openBarberForm(): void {
    const dialogRef = this.dialog.open(BarberForm, {
      width: '600px',
      data: { dni: this.searchDni.trim() }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.uuid) {
        this.handleNewBarberCreated(result);
      }
    });
  }

  private handleNewClientCreated(newClient: Client): void {
    this.clients.push(newClient);
    this.new.client_uuid = newClient.uuid;
    this.clientResult = newClient;
  }

  private handleNewBarberCreated(newBarber: Barber): void {
    this.barbers.push(newBarber);
    this.new.barber_uuid = newBarber.uuid;
    this.barberResult = newBarber;
  }

  //LOGICA DE BARBEROS Y CLIENTES TERMINA AQUI

  onSearchProducts() {
    if (this.searchTerm.trim() === '') {
      this.filteredProducts = []
      return
    }

    const search = this.searchTerm.toLowerCase()
    this.filteredProducts = this.products.filter(p =>
      p.name?.toLowerCase().includes(search) ||
      p.description?.toLowerCase().includes(search)
    )
  }

  addProduct(product: Product) {
    if (!this.new.sale_products) {
      this.new.sale_products = [];
    }

    const exists = this.new.sale_products.find(dp => dp.product_uuid === product.uuid)
    if (exists) {
      Swal.fire({
        icon: 'warning',
        title: 'Producto ya agregado',
        text: 'Este producto ya está en la lista',
      });
      return
    }

    const newDefaultProduct: SaleProduct = {
      product_uuid: product.uuid,
      quantity: 1, // Cantidad por defecto
      cost_type: 'client' // Tipo de costo por defecto
    }

    this.new.sale_products.push(newDefaultProduct)

    // Limpiar búsqueda
    this.searchTerm = '';
    this.filteredProducts = [];
  }

  removeProduct(index: number) {
    if (this.new.sale_products) {
      this.new.sale_products.splice(index, 1)
    }
  }

  getProductName(productUuid: string): string {
    const product = this.products.find(p => p.uuid === productUuid)
    return product?.name || 'Producto no encontrado'
  }

  getProductUnit(productUuid: string): string {
    const product = this.products.find(p => p.uuid === productUuid)
    return product?.unit || 'Producto no encontrado'
  }

  onSave() {
    this.isLoading = true;

    // Validaciones
    if (!this.new.sale_products || this.new.sale_products.length <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Faltan campos',
        text: 'No se han agregado productos a la venta',
      });
      this.isLoading = false;
      return;
    }

    // Validar que todos los productos tengan cantidad y tipo de costo
    const invalidProducts = this.new.sale_products.filter(p =>
      !p.quantity || p.quantity <= 0 || !p.cost_type
    );

    if (invalidProducts.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Datos incompletos',
        text: 'Todos los productos deben tener cantidad y tipo de costo asignados',
      });
      this.isLoading = false;
      return;
    }

    if (this.data) {
      // Actualizar venta existente
      this.saleService.updateSale(this.data.uuid!, this.new).subscribe({
        next: (res) => {
          Swal.fire({
            icon: 'success',
            title: 'Venta editada!',
            text: 'La venta se ha editado exitosamente',
          });
          this.onClose()
          this.isLoading = false;
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'No se ha podido editar la Venta',
            text: err?.error?.message || 'Por favor verifique su conexión a internet o inténtelo más tarde',
          });
          this.isLoading = false;
        }
      })
    } else {
      // Crear nueva venta
      this.saleService.createSale(this.new).subscribe({
        next: (res) => {
          Swal.fire({
            icon: 'success',
            title: 'Venta creada!',
            text: 'La venta se ha creado exitosamente',
          });
          this.onClose()
          this.isLoading = false;
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'No se ha podido crear la Venta',
            text: err?.error?.message || 'Por favor verifique su conexión a internet o inténtelo más tarde',
          });
          this.isLoading = false;
        }
      })
    }
  }

  onClose() {
    this.dialogRef.close();
  }
}