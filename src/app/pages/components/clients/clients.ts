import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import Swal from 'sweetalert2';
import { ExcelHelpModalComponent } from '../../shared/excel/excel';
import { buildWhere } from '../../utils/utils';
import { Client } from '../../../interfaces/client.interface';
import { ClientService } from '../../../services/client.service';
import { ClientForm } from '../../shared/forms/client-form/client-form';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../../material/material-module';
import { SmartTable } from '../../shared/smart-table/smart-table';
import { ExcelColumn, ExcelService } from '../../../services/excel.service';
import { SaleForm } from '../../shared/forms/sale-form/sale-form';

@Component({
  selector: 'app-clients',
  imports: [CommonModule, MaterialModule, FormsModule, ReactiveFormsModule, SmartTable],
  templateUrl: './clients.html',
  styleUrl: './clients.scss'
})
export class Clients implements OnInit, AfterViewInit {
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
        name: 'Nombre',
        key: 'name',
        canFilter: true,
        canSort: true,
        filter: '',
        show: true,
        class: 'relative',
      },
      {
        name: 'ID',
        key: 'dni',
        canFilter: true,
        canSort: true,
        filter: '',
        show: true,
        class: '!font-bold',
      },
      {
        name: 'Correo',
        key: 'email',
        canFilter: true,
        canSort: true,
        filter: '',
        show: true,
        class: 'relative',
      },
      {
        name: 'Telefono',
        key: 'phone',
        canFilter: true,
        canSort: true,
        filter: '',
        show: true,
        class: 'relative',
      },
      {
        name: 'Notas',
        key: 'notes',
        canFilter: true,
        canSort: true,
        filter: '',
        show: true,
        class: '!text-xs !text-gray-500',
      },
    ]
  }

  excelColumns: ExcelColumn[] = [
    {
      key: 'name',
      label: 'Nombre',
      required: true,
      type: 'string',
      possibleKeys: ['Nombre', 'nombre', 'Name', 'name', 'NOMBRE']
    },
    {
      key: 'dni',
      label: 'ID',
      required: true,
      type: 'string',
      possibleKeys: ['ID', 'id', 'dni', 'Dni', 'DNI', 'Identificacion', 'identificacion', 'IDENTIFICACION', 'Id']
    },
    {
      key: 'email',
      label: 'Correo',
      required: false,
      type: 'string',
      possibleKeys: ['Correo', 'correo', 'Email', 'email', 'CORREO']
    },
    {
      key: 'phone',
      label: 'Telefono',
      required: false,
      type: 'string',
      possibleKeys: ['Telefono', 'telefono', 'Phone', 'phone', 'TELEFONO', 'TEL', 'CEL', 'tel', 'cel', 'Celular', 'celular', 'Movil', 'movil'],
    },
    {
      key: 'notes',
      label: 'Notas',
      required: false,
      type: 'string',
      possibleKeys: ['Notas', 'notas', 'Notes', 'notes', 'NOTAS']
    },
  ];

  sortColumn: string = '';
  sortDirection: string = '';

  pageSize = 20;
  pageIndex = 0;
  pageLe = 0;

  data: Client[] = []

  @ViewChild('durationCell') durationCell!: TemplateRef<any>;
  @ViewChild('priceCell') priceCell!: TemplateRef<any>;

  cellTemplates: { [key: string]: TemplateRef<any> } = {};

  showImportHelp = false;

  constructor(private clientSvc: ClientService, private dialog: MatDialog,
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
    var savedView = localStorage.getItem("clients_view");
    if (savedView) {
      if (savedView == 'true') {
        this.view = true
      }
    }
    this.loadData()
  }

  ngAfterViewInit() {
    this.cellTemplates = {
      duration_minutes: this.durationCell,
      price: this.priceCell
    };
  }

  loadData() {
    this.isLoading = true;
    const where = buildWhere(this.result.global, this.result.headers);
    this.clientSvc.getClients(where, this.pageIndex, this.pageSize, this.sortColumn, this.sortDirection)
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

  formatSalary(value: any): string {
    if (value == null) return '$0';
    return '$' + value.toLocaleString('es-CO');
  }

  formatDate(value: any): string {
    if (value == null) return '';
    const date = new Date(value);
    return `${date.toLocaleDateString('es-CO')}`;
  }

  openSaleModal(client: Client) {
    const ref = this.dialog.open(SaleForm, {
      data: {
        client: client,
        client_uuid: client.uuid
      },
      height: '90vh',
    });

    ref.afterClosed().subscribe(() => {
      this.loadData();
    })
  }


  onEditClient(item: Client) {
    this.openClientModal(item);
  }

  onDeleteClient(client: Client) {
    Swal.fire({
      title: '¿Está seguro que desea borrar el cliente?',
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
        this.clientSvc.deleteClient(client.uuid!).subscribe({
          next: (res) => {
            Swal.fire({
              icon: 'success',
              title: 'Cliente eliminado!',
              text: 'El Cliente ha sido eliminado del sistema correctamente.',
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

  openClientModal(item?: Client) {
    const ref = this.dialog.open(ClientForm, {
      width: '600px',
      data: item ?? null
    });

    ref.afterClosed().subscribe(() => {
      this.loadData();
    })
  }


  exportToExcel() {
    // Preparar los datos para la exportación
    const exportData = this.data.map(item => ({
      'Código': item.code || '',
      'Nombre': item.name || '',
      'ID': item.dni || '',
      'Correo': item.email || '',
      'Telefono': item.phone || '',
      'Notas': item.notes || '',
    }));

    this.excelService.exportToExcel(
      exportData,
      'Clientes',
      'Clientes'
    );
  }

  async importFromExcel(event: any) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    try {
      // Obtener todos los clientos existentes para validar duplicados
      const response = await this.clientSvc.getClients('-', 0, 9999, '', '').toPromise();
      const existingClients = response?.content || [];

      // Configurar la importación
      const importConfig = {
        columns: this.excelColumns,
        allowDuplicates: false,
        existingData: existingClients,
        duplicateKey: 'name'
      };

      // Importar y validar
      const validationResult = await this.excelService.importFromExcel(file, importConfig);

      if (!validationResult) {
        event.target.value = '';
        return;
      }

      // Mostrar resumen y obtener confirmación
      const shouldProceed = await this.excelService.showImportSummary(validationResult, 'clientes');

      if (shouldProceed) {
        // Ejecutar la importación
        const importResult = await this.excelService.executeImport(
          validationResult.validData,
          (client: Client) => this.clientSvc.createClient(client).toPromise(),
          'clientes'
        );

        // Mostrar resultado
        this.excelService.showImportResult(importResult, 'clientes');

        // Recargar datos
        this.loadData();
      }

    } catch (error) {
      console.error('Error en la importación:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error en la importación',
        text: 'Ocurrió un error inesperado durante la importación.',
      });
    }

    event.target.value = ''; // Limpiar el input
  }

  openImportHelpModal() {
    this.dialog.open(ExcelHelpModalComponent, {
      width: '600px',
      disableClose: false,
      data: {
        columns: this.excelColumns,
        entityName: 'clientes',
        templateFileName: 'plantilla_importar_clientes',
        exampleData: [
          {
            'Nombre': 'Cliente de Ejemplo',
            'ID': '1001123456',
            'Correo': 'prueba@mymail.com',
            'Telefono': '3001013030',
            'Notas': '',
          },
        ]
      }
    });
  }

  getInitials(name: string) {
    const separate = name.split(" ")
    let result = ''
    for (const word of separate) {
      result += word.substring(0, 1)
    }
    return result.substring(0, 2);
  }

  changeView() {
    this.view = !this.view
    localStorage.setItem("clients_view", `${this.view}`)
  }
}
