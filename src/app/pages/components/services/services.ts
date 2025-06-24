import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import Swal from 'sweetalert2';
import { ExcelColumn, ExcelService } from '../../../services/excel.service';
import { ExcelHelpModalComponent } from '../../shared/excel/excel';
import { buildWhere } from '../../utils/utils';
import { Service } from '../../../interfaces/service.interface';
import { ServiceService } from '../../../services/service.service';
import { ServiceForm } from '../../shared/forms/service-form/service-form';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../../material/material-module';
import { SmartTable } from '../../shared/smart-table/smart-table';

@Component({
  selector: 'app-services',
  imports: [CommonModule, MaterialModule, FormsModule, ReactiveFormsModule, SmartTable],
  templateUrl: './services.html',
  styleUrl: './services.scss'
})
export class Services implements OnInit, AfterViewInit {
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
        name: 'Descripción',
        key: 'description',
        canFilter: true,
        canSort: true,
        filter: '',
        show: true,
        class: 'text-xs !text-gray-600',
      },
      {
        name: 'Precio',
        key: 'price',
        canFilter: false,
        canSort: true,
        filter: '',
        show: true,
        class: '!text-amber-600 font-bold',
      },
      {
        name: 'Duración',
        key: 'duration_minutes',
        canFilter: false,
        canSort: true,
        filter: '',
        show: true,
        class: 'relative',
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
      key: 'description',
      label: 'Descripción',
      required: false,
      type: 'string',
      possibleKeys: ['Descripcion', 'descripcion', 'Description', 'description', 'DESCRIPCION']
    },
    {
      key: 'price',
      label: 'Precio',
      required: false,
      type: 'string',
      possibleKeys: ['Precio', 'precio', 'price', 'Price', 'PRECIO']
    },
    {
      key: 'duration_minutes',
      label: 'Duración (en minutos)',
      required: false,
      type: 'string',
      possibleKeys: ['Duracion', 'duracion', 'duration_minutes', 'Duration_minutes', 'duration', 'Duration', 'DURACION', 'Duracion (en minutos)']
    },
  ];

  sortColumn: string = '';
  sortDirection: string = '';

  pageSize = 20;
  pageIndex = 0;
  pageLe = 0;

  data: Service[] = []

  @ViewChild('durationCell') durationCell!: TemplateRef<any>;
  @ViewChild('priceCell') priceCell!: TemplateRef<any>;

  cellTemplates: { [key: string]: TemplateRef<any> } = {};

  showImportHelp = false;

  constructor(private serviceSvc: ServiceService, private dialog: MatDialog,
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
    this.serviceSvc.getServices(where, this.pageIndex, this.pageSize, this.sortColumn, this.sortDirection)
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

  onEditService(item: Service) {
    this.openServiceModal(item);
  }

  onDeleteService(service: Service) {
    Swal.fire({
      title: '¿Está seguro que desea borrar el servicio?',
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
        this.serviceSvc.deleteService(service.uuid!).subscribe({
          next: (res) => {
            Swal.fire({
              icon: 'success',
              title: 'Servicio eliminado!',
              text: 'El Servicio ha sido eliminado del sistema correctamente.',
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

  openServiceModal(item?: Service) {
    const ref = this.dialog.open(ServiceForm, {
      width: '600px',
      height: '90vh',
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
      'Descripcion': item.description || '',
      'Precio': item.price || '',
      'Duracion (en minutos)': item.duration_minutes || ''
    }));

    this.excelService.exportToExcel(
      exportData,
      'Servicios',
      'Servicios'
    );
  }

  async importFromExcel(event: any) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    try {
      // Obtener todos los serviceos existentes para validar duplicados
      const response = await this.serviceSvc.getServices('-', 0, 9999, '', '').toPromise();
      const existingServices = response?.content || [];

      // Configurar la importación
      const importConfig = {
        columns: this.excelColumns,
        allowDuplicates: false,
        existingData: existingServices,
        duplicateKey: 'name'
      };

      // Importar y validar
      const validationResult = await this.excelService.importFromExcel(file, importConfig);

      if (!validationResult) {
        event.target.value = '';
        return;
      }

      // Mostrar resumen y obtener confirmación
      const shouldProceed = await this.excelService.showImportSummary(validationResult, 'servicios');

      if (shouldProceed) {
        // Ejecutar la importación
        const importResult = await this.excelService.executeImport(
          validationResult.validData,
          (service: Service) => this.serviceSvc.createService(service).toPromise(),
          'servicios'
        );

        // Mostrar resultado
        this.excelService.showImportResult(importResult, 'servicios');

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
        entityName: 'servicios',
        templateFileName: 'plantilla_importar_servicios',
        exampleData: [
          {
            'Nombre': 'Servicio de Ejemplo',
            'Descripcion': 'Descripción de ejemplo',
            'Precio': '25000',
            'Duracion (en minutos)': '30'
          },
        ]
      }
    });
  }
}
