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
  searchProduct: string = ''

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
    this.productSvc.getProducts('-', 0, 999999).subscribe((p) => {
      this.products = p.content
      this.filteredProducts = p.content
    });
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

      if (this.new.client) {
        this.clientResult = this.new.client;
        if (this.clientResult) {
          this.searchDni = this.new.client.uuid || '';
        }
      }

      if (this.new.barber) {
        this.barberResult = this.new.barber;
        if (this.barberResult) {
          this.searchDni = this.new.barber.uuid || '';
        }
      }
    }else{
      const iva = localStorage.getItem("iva")
      if(iva){
        const data = JSON.parse(iva);
        this.new.iva = data.iva;
        this.new.has_iva = data.has_iva;
        this.new.iva_product = data.iva_product;
        this.new.iva_service = data.iva_service;
      }
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
        this.getTotals();
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
        this.getTotals();
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

  onSearchProduct(): void {

    if (!this.searchProduct || this.searchProduct.trim() === '') {
      return;
    }

    const filterValue = this.searchProduct.toLowerCase().trim();
    this.filteredProducts = this.products.filter(product =>
      product.name?.toLowerCase().includes(filterValue) ||
      product.description?.includes(filterValue)
    ).slice(0, 10);
  }

  setClient(client: Client) {
    this.clientResult = client;
    this.new.client_uuid = client.uuid;
    this.getTotals();
  }

  unsetClient() {
    this.clientResult = null;
    this.new.client_uuid = undefined;
    this.getTotals();
  }

  setBarber(barber: Barber) {
    this.barberResult = barber;
    this.new.barber_uuid = barber.uuid;
    this.getTotals();
  }

  unsetBarber() {
    this.barberResult = null;
    this.new.barber_uuid = undefined;
    this.getTotals();
  }

  formatSalary(value: any): string {
    if (value == null) return '$0';
    return '$' + value.toLocaleString('es-CO');
  }

  addProduct(product: Product) {
    this.searchProduct = ''
    const newA = this.new.products || []
    newA.push({
      product: product,
      product_uuid: product.uuid,
      quantity: 1,
      price: product.price,
      total: product.price,
    })
    this.new.products = newA;
    this.getTotals();
  }

  addService(service: Service) {
    this.searchService = ''
    const used: SaleServiceProductDto[] = []
    if (service.default_products) {
      for (const dp of service.default_products) {
        var price = dp.product?.price
        if(dp.product?.unit != 'u' && dp.product?.size_per_unit && dp.product?.price && dp.quantity) {
          price = (dp.quantity * dp.product.price)/dp.product.size_per_unit
        }
        used.push({
          product: dp.product,
          product_uuid: dp.product_uuid,
          quantity: dp.quantity,
          unit: dp.product?.unit,
          cost_type: dp.cost_type,
          price: price,
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
      detail: used.length > 0
    })
    this.new.services = newA;
    this.getTotals();
  }

  addServiceProduct(i: number, product: Product) {
    const newP = this.new.services?.[i].used_products || []
    newP.push({
      product: product,
      product_uuid: product.uuid,
      unit: product?.unit,
      cost_type: 'cortesy',
    })
    this.getTotals();
  }


  deleteService(i: number) {
    this.new.services?.splice(i, 1)
    this.getTotals();
  }

  deleteServiceProduct(i: number, j: number) {
    this.new.services?.[i]?.used_products?.splice(j, 1)
    this.getTotals();
  }

  deletePRoduct(i: number) {
    this.new.products?.splice(i, 1)
    this.getTotals();
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
      data: { dni: this.searchBarber.trim() }
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
    this.getTotals();
  }

  private handleNewBarberCreated(newBarber: Barber): void {
    this.barbers.push(newBarber);
    this.new.barber_uuid = newBarber.uuid;
    this.barberResult = newBarber;
    this.getTotals();
  }

  //LOGICA DE BARBEROS Y CLIENTES TERMINA AQUI
  getTotals() {
    var subtotalServices = 0
    var subtotalProducts = 0
    var subtotalServiceProducts = 0
    var subtotalTec = 0
    this.new.services?.forEach(s => {
      if(this.new.barber_uuid && this.barberResult && this.barberResult.commission_rate){
        s.commission_rate = this.barberResult.commission_rate
      }
      subtotalServices += (s.price || 0)
      s.used_products?.forEach(up => {
        if(up.cost_type == 'client') {
          subtotalServiceProducts += (up.price || 0)
        }
        if(up.cost_type == 'barber') {
          subtotalTec += (up.price || 0)
        }
      })
    })
    this.new.products?.forEach(p => {
      p.total = (p.price || 0) * (p.quantity || 0)
      subtotalProducts += (p.total || 0)
    })
    var commisions = 0
    if(this.new.barber_uuid && this.barberResult && this.barberResult.commission_rate){
      commisions = (this.barberResult.commission_rate * subtotalServices)/100
    }
    this.new.subtotal_services = subtotalServices
    this.new.subtotal_service_products = subtotalServiceProducts
    this.new.subtotal_products = subtotalProducts
    this.new.commissions = (commisions)
    this.new.commission_discount = (subtotalTec)

    const objIva = {
      has_iva: this.new.has_iva,
      iva_service: this.new.iva_service,
      iva_product: this.new.iva_product,
      iva: this.new.iva
    }

    localStorage.setItem("iva", JSON.stringify(objIva))
    var subtotalServicesWithIva = subtotalServices
    var subtotalServicesProductsWithIva = subtotalServiceProducts
    var subtotalProductsWithIva = subtotalProducts

    if(this.new.has_iva && this.new.iva && this.new.iva > 0){
      if(this.new.iva_service){
        subtotalServicesWithIva = (subtotalServices + (subtotalServices * this.new.iva / 100))
      }
      if(this.new.iva_product){
        subtotalProductsWithIva = (subtotalProducts + (subtotalProducts * this.new.iva / 100))
        subtotalServicesProductsWithIva = (subtotalServiceProducts + (subtotalServiceProducts * this.new.iva / 100))
      }
    }
    this.new.subtotal_services_iva = subtotalServicesWithIva;
    this.new.subtotal_service_products_iva = subtotalServicesProductsWithIva;
    this.new.subtotal_products_iva = subtotalProductsWithIva;

    this.new.total = (subtotalServicesWithIva + subtotalServicesProductsWithIva + subtotalProductsWithIva)
  }

  onSave() {
    this.isLoading = true;

    // Validaciones
    if (((this.new.services || []).length <= 0) && (this.new.products || []).length <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Venta vacia',
        text: 'No se han agregado servicios ni productos a la venta',
      });
      this.isLoading = false;
      return;
    }

    console.log(this.new)
    let validationFields = false
    this.new.services?.forEach(s => {
      if (!s.price) {
        validationFields = true;
      }
      if (s.used_products) {
        s.used_products.forEach(up => {
          if (up.cost_type == 'cortesy') {
            if (!up.quantity) {
              validationFields = true;
            }
          } else {
            if (!up.price || !up.quantity) {
              validationFields = true;
            }
          }

        })
      }
    })
    this.new.products?.forEach(p => {
      if (!p.price || !p.quantity || !p.total) {
        validationFields = true;
      }
    })

    if (validationFields) {
      Swal.fire({
        icon: 'error',
        title: 'Datos incompletos',
        text: 'Hay algunos campos sin rellenar en servicios o productos',
      });
      this.isLoading = false;
      return;
    }

    if (this.data?.uuid) {
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