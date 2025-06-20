import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import Swal from 'sweetalert2';
import { ExcelHelpModalComponent } from '../../shared/excel/excel';
import { buildWhere } from '../../utils/utils';
import { Barber } from '../../../interfaces/barber.interface';
import { BarberService } from '../../../services/barber.service';
import { BarberForm } from '../../shared/forms/barber-form/barber-form';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../../material/material-module';
import { SmartTable } from '../../shared/smart-table/smart-table';
import { ExcelColumn, ExcelService } from '../../../services/excel.service';

@Component({
  selector: 'app-barbers',
  imports: [CommonModule, MaterialModule, FormsModule, ReactiveFormsModule, SmartTable],
  templateUrl: './barbers.html',
  styleUrl: './barbers.scss'
})
export class Barbers implements OnInit, AfterViewInit {
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
        class: 'relative !font-bold',
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
        name: 'Salario Base',
        key: 'base_salary',
        canFilter: false,
        canSort: true,
        filter: '',
        show: true,
        class: '!text-green-700 !font-bold',
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
      key: 'base_salary',
      label: 'Salario Base',
      required: false,
      type: 'string',
      possibleKeys: ['Salario Base', 'Salario', 'salary', 'Salary', 'SALARIO', 'SALARIO BASE', 'salario base']
    },
  ];

  sortColumn: string = '';
  sortDirection: string = '';

  pageSize = 20;
  pageIndex = 0;

  data: Barber[] = []

  @ViewChild('baseCell') baseCell!: TemplateRef<any>;

  cellTemplates: { [key: string]: TemplateRef<any> } = {};

  showImportHelp = false;

  constructor(private barberSvc: BarberService, private dialog: MatDialog,
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
    if(savedView) {
      if(savedView == 'true'){
        this.view = true
      }
    }
    this.loadData()
  }

  ngAfterViewInit() {
    this.cellTemplates = {
      base_salary: this.baseCell
    };
  }

  formatSalary(value: any): string {
    if (value == null) return '$0';
    return '$' + value.toLocaleString('es-CO');
  }

  loadData() {
    this.isLoading = true;
    const where = buildWhere(this.result.global, this.result.headers);
    this.barberSvc.getBarbers(where, this.pageIndex, this.pageSize, this.sortColumn, this.sortDirection)
      .subscribe(res => {
        this.isLoading = false;
        this.data = res.content;
        this.pageSize = res.size;
        this.pageIndex = res.number;
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

  onEditBarber(item: Barber) {
    this.openBarberModal(item);
  }

  onDeleteBarber(barber: Barber) {
    Swal.fire({
      title: '¿Está seguro que desea borrar el empleado?',
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
        this.barberSvc.deleteBarber(barber.uuid!).subscribe({
          next: (res) => {
            Swal.fire({
              icon: 'success',
              title: 'Empleado eliminado!',
              text: 'El Empleado ha sido eliminado del sistema correctamente.',
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

  openBarberModal(item?: Barber) {
    const ref = this.dialog.open(BarberForm, {
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
      'Salario Base': item.base_salary || '',
    }));

    this.excelService.exportToExcel(
      exportData,
      'Empleados',
      'Empleados'
    );
  }

  async importFromExcel(event: any) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    try {
      // Obtener todos los barberos existentes para validar duplicados
      const response = await this.barberSvc.getBarbers('-', 0, 9999, '', '').toPromise();
      const existingBarbers = response?.content || [];

      // Configurar la importación
      const importConfig = {
        columns: this.excelColumns,
        allowDuplicates: false,
        existingData: existingBarbers,
        duplicateKey: 'name'
      };

      // Importar y validar
      const validationResult = await this.excelService.importFromExcel(file, importConfig);

      if (!validationResult) {
        event.target.value = '';
        return;
      }

      // Mostrar resumen y obtener confirmación
      const shouldProceed = await this.excelService.showImportSummary(validationResult, 'empleados');

      if (shouldProceed) {
        // Ejecutar la importación
        const importResult = await this.excelService.executeImport(
          validationResult.validData,
          (barber: Barber) => this.barberSvc.createBarber(barber).toPromise(),
          'empleados'
        );

        // Mostrar resultado
        this.excelService.showImportResult(importResult, 'empleados');

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
        entityName: 'empleados',
        templateFileName: 'plantilla_importar_empleados',
        exampleData: [
          {
            'Nombre': 'Empleado de Ejemplo',
            'ID': '1001123456',
            'Correo': 'prueba@mymail.com',
            'Telefono': '3001013030',
            'Salario Base': '600000',
          },
        ]
      }
    });
  }

  getInitials(name: string) {
    const separate = name.split(" ")
    let result = ''
    for (const word of separate) {
      result += word.substring(0,1)
    }
    return result.substring(0,2);
  }

  changeView() {
    this.view = !this.view
    localStorage.setItem("employees_view", `${this.view}`)
  }
}
