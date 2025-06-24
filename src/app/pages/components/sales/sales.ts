import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import Swal from 'sweetalert2';
import { buildWhere } from '../../utils/utils';
import { Sale } from '../../../interfaces/sale.interface';
import { SaleService } from '../../../services/sale.service';
import { SaleForm } from '../../shared/forms/sale-form/sale-form';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../../material/material-module';
import { SmartTable } from '../../shared/smart-table/smart-table';
import { ExcelColumn, ExcelService } from '../../../services/excel.service';
import { PayForm } from '../../shared/forms/pay-form/pay-form';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-sales',
  imports: [CommonModule, MaterialModule, FormsModule, ReactiveFormsModule, SmartTable],
  templateUrl: './sales.html',
  styleUrl: './sales.scss'
})
export class Sales implements OnInit, AfterViewInit {
  view = false;
  isLoading = true;
  viewStatistics = false;
  viewSearch = false;
  viewFilters = false;
  pMode = 2;

  result = {
    global: '',
    headers: [
      {
        name: 'Código',
        key: 'code',
        canFilter: true,
        canSort: true,
        filter: '',
        show: true,
        class: 'relative primary',
      },
      {
        name: 'Fecha',
        key: 'created_at',
        canFilter: false,
        canSort: true,
        filter: '',
        show: true,
        class: 'relative',
      },
      {
        name: 'Cliente',
        key: 'client.name',
        canFilter: false,
        canSort: false,
        filter: '',
        show: true,
        class: 'relative !font-bold',
      },
      {
        name: 'Técnico',
        key: 'barber.name',
        canFilter: false,
        canSort: false,
        filter: '',
        show: true,
        class: 'relative',
      },
      {
        name: 'Venta',
        key: 'list',
        canFilter: false,
        canSort: false,
        filter: '',
        show: true,
        class: 'relative',
      },
      {
        name: 'Total',
        key: 'total',
        canFilter: false,
        canSort: true,
        filter: '',
        show: true,
        class: '!text-green-600 !font-bold',
      },
      {
        name: 'Estado',
        key: 'status',
        canFilter: false,
        canSort: true,
        filter: '',
        show: true,
        class: 'relative !font-bold',
      }
    ]
  }

  sortColumn: string = 'created_at';
  sortDirection: string = 'desc';

  pageSize = 20;
  pageIndex = 0;
  pageLe = 0;

  data: Sale[] = []

  @ViewChild('totalCell') totalCell!: TemplateRef<any>;
  @ViewChild('dateCell') dateCell!: TemplateRef<any>;
  @ViewChild('statusCell') statusCell!: TemplateRef<any>;
  @ViewChild('listCell') listCell!: TemplateRef<any>;

  cellTemplates: { [key: string]: TemplateRef<any> } = {};

  showImportHelp = false;

  constructor(private saleSvc: SaleService, private dialog: MatDialog,
    private excelService: ExcelService
  ) { }

  tooglePMode() {
    if (this.pMode == 4) {
      this.pMode = 2
    } else if (this.pMode == 2) {
      this.pMode = 1
    } else {
      this.pMode = 4
    }
  }

  onSortChange({ column, direction }: { column: string, direction: string }) {
    this.sortColumn = column;
    this.sortDirection = direction;
    this.loadData();
  }

  onGlobalChange(global: string) {
    this.result.global = global;
    this.loadData();
  }

  onDivClick(event: MouseEvent) {
    event.stopPropagation();
  }

  viewAllColumns() {
    this.result.headers.forEach(h => {
      h.show = true
    })
  }

  ngOnInit(): void {
    var savedView = localStorage.getItem("employees_view");
    if (savedView) {
      if (savedView == 'true') {
        this.view = true
      }
    }
    this.loadData()
  }

  ngAfterViewInit() {
    this.cellTemplates = {
      total: this.totalCell,
      created_at: this.dateCell,
      status: this.statusCell,
      list: this.listCell,
    };
  }

  formatSalary(value: any): string {
    if (value == null) return '$0';
    return '$' + value.toLocaleString('es-CO');
  }

  formatDate(value: any): string {
    if (value == null) return '';
    const date = new Date(value);
    return `${date.toLocaleDateString('es-CO')} ${date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })}`;
  }

  formatStatus(value: any): string {
    if (value == null) return '';
    if (value == 'PENDING') {
      return 'PENDIENTE';
    }
    if (value == 'PAID') {
      return 'COMPLETADO';
    }
    return '';
  }

  formatList(value: Sale): string {
    if (value == null) return '';

    const serviceNames = value.services?.map(s => s.service?.name)?.filter(Boolean) ?? [];
    const productNames = value.products?.map(p => p.product?.name)?.filter(Boolean) ?? [];

    return [...serviceNames, ...productNames].join('\r\n'); // Salto de línea compatible con Excel
  }

  loadData() {
    this.isLoading = true;
    const where = buildWhere(this.result.global, this.result.headers);
    this.saleSvc.getSales(where, this.pageIndex, this.pageSize, this.sortColumn, this.sortDirection)
      .subscribe(res => {
        this.isLoading = false;
        this.data = res.content;
        this.pageSize = res.size;
        this.pageIndex = res.number;
        this.pageLe = res.total_elements;
      });
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadData();
  }

  getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
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

  onEditSale(item: Sale) {
    this.openSaleModal(item);
  }

  onPaySale(item: Sale) {
    const ref = this.dialog.open(PayForm, {
      data: item ?? null,
    });

    ref.afterClosed().subscribe(() => {
      this.loadData();
    })
  }

  onViewSale(item: Sale) {
    const ref = this.dialog.open(SaleForm, {
      data: { ...item, read: true },
      height: '90vh',
    })
    ref.afterClosed().subscribe(() => {
      this.loadData();
    })
  }


  onDeleteSale(sale: Sale) {
    Swal.fire({
      title: '¿Está seguro que desea borrar la venta?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      reverseButtons: true,
      showCancelButton: true,
      confirmButtonColor: '#732299',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.saleSvc.deleteSale(sale.uuid!).subscribe({
          next: (res) => {
            Swal.fire({
              icon: 'success',
              title: 'Venta eliminada!',
              text: 'La venta ha sido eliminada del sistema correctamente.',
            });
            this.loadData();
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'No se ha podido eliminar',
              text: err?.error?.message || 'Porfavor verifique su conexión a internet o intentelo más tarde',
            });
          }
        });
      }
    });
  }

  openSaleModal(item?: Sale) {
    const ref = this.dialog.open(SaleForm, {
      data: item ?? null,
      height: '90vh',
    });

    ref.afterClosed().subscribe(() => {
      this.loadData();
    })
  }


  exportToExcel() {
    // Preparar los datos para la exportación
    const exportData = this.data.map(item => ({
      'Código': item.code || '',
      'Fecha': this.formatDate(item.created_at),
      'Cliente': item.client?.name,
      'Tecnico': item.barber?.name,
      'Venta': this.formatList(item),
      'Total': item.total,
      'Estado': this.formatStatus(item.status)
    }));

    this.excelService.exportToExcel(
      exportData,
      'Ventas',
      'Ventas'
    );
  }

  changeView() {
    this.view = !this.view
    localStorage.setItem("employees_view", `${this.view}`)
  }

  onPrintSale(sale: Sale) {
    // Crear el contenido HTML del ticket
    const ticketContent = this.generateTicketHTML(sale);

    // Crear un div temporal para renderizar el ticket
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = ticketContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.fontFamily = 'Courier Prime, monospace';
    document.body.appendChild(tempDiv);

    // Configurar html2canvas para capturar el contenido
    html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    }).then(canvas => {
      // Remover el div temporal
      document.body.removeChild(tempDiv);

      // Crear PDF con dimensiones de ticket (80mm de ancho típico)
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, canvas.height * 80 / canvas.width] // Ancho fijo 80mm, alto proporcional
      });

      // Agregar la imagen al PDF
      pdf.addImage(imgData, 'PNG', 0, 0, 80, canvas.height * 80 / canvas.width);

      // Descargar o imprimir
      pdf.save(`factura-${sale.code}.pdf`);

      // Opcional: Abrir ventana de impresión
      // const pdfUrl = pdf.output('bloburl');
      // window.open(pdfUrl, '_blank');
    });
  }

  generateTicketHTML(sale: Sale): string {
    const servicesList = sale.services?.map(s =>
      `<div class="item-line">
      <span class="item-name">${s.service?.name || 'Servicio'}</span>
      <span class="item-price">$${(s.price || 0).toLocaleString('es-CO')}</span>
    </div>`
    ).join('') || '';

    const productsList = sale.products?.map(p =>
      `<div class="item-line">
      <span class="item-name">${p.product?.name || 'Producto'} x${p.quantity || 1}</span>
      <span class="item-price">${(p.total || 0).toLocaleString('es-CO')}</span>
    </div>`
    ).join('') || '';

    // Productos usados en servicios
    const serviceProductsList = sale.services?.flatMap(service =>
      service.used_products
        ?.filter(sp => sp.cost_type === 'client')
        ?.map(sp =>
          `<div class="item-line">
       <span class="item-name">${sp.product?.name || 'Producto'} x${sp.quantity || 1} ${sp.unit || ''}</span>
       <span class="item-price">$${(sp.price || 0).toLocaleString('es-CO')}</span>
     </div>`
        ) || []
    ).join('') || '';

    var formatPayment = 'Efectivo'
    if (sale.payment_method == 'Card') {
      formatPayment = 'Tarjeta'
    }
    if (sale.payment_method == 'Transfer') {
      formatPayment = 'Transferencia'
    }
    if (sale.payment_method == 'Other') {
      formatPayment = 'Otro'
    }

    return `
    <div style="
      width: 280px;
      font-family: 'Courier Prime', monospace;
      font-size: 12px;
      line-height: 1.4;
      color: #000;
      background: white;
      padding: 10px;
      margin: 0;
    ">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 15px;">
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">
          BARBERÍA ÉLITE
        </div>
        <div style="font-size: 10px; margin-bottom: 3px;">
          Dirección de la barbería
        </div>
        <div style="font-size: 10px; margin-bottom: 3px;">
          Tel: (123) 456-7890
        </div>
        <div style="font-size: 10px;">
          NIT: 123456789-0
        </div>
      </div>

      <!-- Línea separadora -->
      <div style="border-top: 1px dashed #000; margin: 10px 0;"></div>

      <!-- Información de la venta -->
      <div style="margin-bottom: 15px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span>Factura:</span>
          <span style="font-weight: bold;">${sale.code || 'N/A'}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span>Fecha:</span>
          <span>${this.formatDate(sale.created_at)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span>Cliente:</span>
          <span>${sale.client?.name || 'Cliente General'}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
          <span>Técnico:</span>
          <span>${sale.barber?.name || 'N/A'}</span>
        </div>
      </div>

      <!-- Línea separadora -->
      <div style="border-top: 1px dashed #000; margin: 10px 0;"></div>

      <!-- Servicios -->
      ${sale.services && sale.services.length > 0 ? `
        <div style="margin-bottom: 15px;">
          <div style="font-weight: bold; margin-bottom: 8px; text-align: center;">
            SERVICIOS
          </div>
          ${servicesList}
        </div>
      ` : ''}

      <!-- Productos usados en servicios -->
      ${serviceProductsList ? `
        <div style="margin-bottom: 15px;">
          <div style="font-weight: bold; margin-bottom: 8px; text-align: center;">
            PRODUCTOS USADOS EN SERVICIOS
          </div>
          ${serviceProductsList}
        </div>
      ` : ''}

      <!-- Productos -->
      ${sale.products && sale.products.length > 0 ? `
        <div style="margin-bottom: 15px;">
          <div style="font-weight: bold; margin-bottom: 8px; text-align: center;">
            PRODUCTOS VENDIDOS
          </div>
          ${productsList}
        </div>
      ` : ''}

      <!-- Línea separadora -->
      <div style="border-top: 1px dashed #000; margin: 10px 0;"></div>

      <!-- Totales -->
      <div style="margin-bottom: 15px;">
        ${sale.subtotal_services ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span>Subtotal Servicios:</span>
            <span>$${sale.subtotal_services.toLocaleString('es-CO')}</span>
          </div>
        ` : ''}
        ${sale.subtotal_services && sale.iva && sale.has_iva && sale.iva_service ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span>IVA Servicios:</span>
            <span>$${((sale.subtotal_services_iva ?? 0) - (sale.subtotal_services ?? 0)).toLocaleString('es-CO')}</span>
          </div>
        ` : ''}
        ${(sale.subtotal_products || sale.subtotal_service_products) ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span>Subtotal Productos:</span>
            <span>$${((sale.subtotal_products ?? 0) + (sale.subtotal_service_products ?? 0)).toLocaleString('es-CO')}</span>
          </div>
        ` : ''}
        ${(sale.subtotal_products || sale.subtotal_service_products) && sale.iva && sale.has_iva && sale.iva_product ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span>IVA Productos:</span>
            <span>$${(((sale.subtotal_service_products_iva ?? 0) + (sale.subtotal_products_iva ?? 0)) - ((sale.subtotal_service_products ?? 0) + (sale.subtotal_products ?? 0))).toLocaleString('es-CO')}</span>
          </div>
        ` : ''}
        ${sale.discount_percent ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span>Descuento (${sale.discount_percent}%):</span>
            <span>-$${(sale.subtotal_discount || 0).toLocaleString('es-CO')}</span>
          </div>
        ` : ''}
        <div style="border-top: 1px solid #000; margin: 8px 0 5px 0;"></div>
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px;">
          <span>TOTAL:</span>
          <span>$${(sale.total || 0).toLocaleString('es-CO')}</span>
        </div>
      </div>

      <!-- Método de pago -->
      ${sale.payment_method ? `
        <div style="margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between;">
            <span>Método de Pago:</span>
            <span style="font-weight: bold;">${formatPayment}</span>
          </div>
        </div>
      ` : ''}

      <!-- Línea separadora -->
      <div style="border-top: 1px dashed #000; margin: 10px 0;"></div>

      <!-- Footer -->
      <div style="text-align: center; font-size: 10px; margin-top: 15px;">
        <div style="margin-bottom: 5px;">
          ¡Gracias por su visita!
        </div>
        <div>
          Software desarrollado por CODFY S.A.S.
        </div>
      </div>
    </div>

    <style>
      .item-line {
        display: flex;
        justify-content: space-between;
        margin-bottom: 3px;
        align-items: flex-start;
      }
      .item-name {
        flex: 1;
        margin-right: 10px;
        word-wrap: break-word;
      }
      .item-price {
        font-weight: bold;
        white-space: nowrap;
      }
    </style>
  `;
  }

  // Función alternativa para impresión directa (sin PDF)
  printTicketDirect(sale: Sale) {
    const ticketContent = this.generateTicketHTML(sale);

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (printWindow) {
      printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Factura ${sale.code}</title>
        <link href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
        <style>
          body { 
            margin: 0; 
            padding: 20px;
            font-family: 'Courier Prime', monospace;
          }
          @media print {
            body { margin: 0; padding: 10px; }
            @page { margin: 5mm; size: 80mm auto; }
          }
        </style>
      </head>
      <body>
        ${ticketContent}
      </body>
      </html>
    `);

      printWindow.document.close();

      // Esperar a que cargue la fuente antes de imprimir
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 1000);
    }
  }
}
