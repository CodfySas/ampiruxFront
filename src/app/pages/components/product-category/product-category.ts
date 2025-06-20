import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../../material/material-module';
import { SmartTable } from '../../shared/smart-table/smart-table';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import Swal from 'sweetalert2';
import { Product, ProductCategory as Category } from '../../../interfaces/product.interface';
import { ExcelColumn, ExcelService } from '../../../services/excel.service';
import { ExcelHelpModalComponent } from '../../shared/excel/excel';
import { ProductForm } from '../../shared/forms/product-form/product-form';
import { buildWhere } from '../../utils/utils';
import { CategoryService } from '../../../services/product-category.service';
import { CategoryForm } from '../../shared/forms/category-form/category-form';

@Component({
  selector: 'app-product-category',
  imports: [CommonModule, MaterialModule, FormsModule, ReactiveFormsModule, SmartTable],
  templateUrl: './product-category.html',
  styleUrl: './product-category.scss'
})
export class ProductCategory implements OnInit, AfterViewInit {
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
  
  ];

  sortColumn: string = '';
  sortDirection: string = '';

  pageSize = 20;
  pageIndex = 0;

  data: Category[] = []

  @ViewChild('nameCell') nameCell!: TemplateRef<any>;
  @ViewChild('stockCell') stockCell!: TemplateRef<any>;
  @ViewChild('priceCell') priceCell!: TemplateRef<any>;

  cellTemplates: { [key: string]: TemplateRef<any> } = {};

  showImportHelp = false;

  constructor(private categorySvc: CategoryService, private dialog: MatDialog,
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
      name: this.nameCell,
      stock: this.stockCell,
      price: this.priceCell
    };
  }

  loadData() {
    this.isLoading = true;
    const where = buildWhere(this.result.global, this.result.headers);
    this.categorySvc.getCategories(where, this.pageIndex, this.pageSize, this.sortColumn, this.sortDirection)
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

  onEditProduct(item: Category) {
    this.openProductModal(item);
  }

  onDeleteProduct(product: Product) {
    Swal.fire({
      title: '¿Está seguro que desea borrar la categoria?',
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
        this.categorySvc.deleteProductCategory(product.uuid!).subscribe({
          next: (res) => {
            Swal.fire({
              icon: 'success',
              title: 'Categoría eliminada!',
              text: 'La Categoría ha sido eliminada del sistema correctamente.',
            });
            this.loadData();
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'No se ha podido eliminar la categoría',
              text: err?.error?.message || 'Porfavor verifique su conexión a internet o intentelo más tarde',
            });
          }
        });
      }
    });
  }

  openProductModal(item?: Category) {
    const ref = this.dialog.open(CategoryForm, {
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
    }));

    this.excelService.exportToExcel(
      exportData,
      'Categorias',
      'Categorias'
    );
  }

  async importFromExcel(event: any) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    try {
      // Obtener todos los productos existentes para validar duplicados
      const response = await this.categorySvc.getCategories('-', 0, 9999, '', '').toPromise();
      const existingProducts = response?.content || [];

      // Configurar la importación
      const importConfig = {
        columns: this.excelColumns,
        allowDuplicates: false,
        existingData: existingProducts,
        duplicateKey: 'name'
      };

      // Importar y validar
      const validationResult = await this.excelService.importFromExcel(file, importConfig);
      
      if (!validationResult) {
        event.target.value = '';
        return;
      }

      // Mostrar resumen y obtener confirmación
      const shouldProceed = await this.excelService.showImportSummary(validationResult, 'categorias');

      if (shouldProceed) {
        // Ejecutar la importación
        const importResult = await this.excelService.executeImport(
          validationResult.validData,
          (category: Category) => this.categorySvc.createProductCategory(category).toPromise(),
          'categorias'
        );

        // Mostrar resultado
        this.excelService.showImportResult(importResult, 'categorias');

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
        entityName: 'categorias',
        templateFileName: 'plantilla_importar_categorias',
        exampleData: [
          {
            'Nombre': 'Categoria Ejemplo 1',
          },
          {
            'Nombre': 'Categoria Ejemplo 2',
          }
        ]
      }
    });
  }
}
