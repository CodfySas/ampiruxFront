import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MaterialModule } from '../../../material/material-module';
import { Card } from '../../shared/card/card';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../interfaces/product.interface';
import { SmartTable } from '../../shared/smart-table/smart-table';
import { buildWhere } from '../../utils/utils';
import { MatDialog } from '@angular/material/dialog';
import { ProductForm } from '../../shared/forms/product-form/product-form';
import Swal from 'sweetalert2';
import { ExcelHelpModalComponent } from '../../shared/excel/excel';
import { ExcelColumn, ExcelService } from '../../../services/excel.service';

@Component({
  selector: 'app-products',
  imports: [CommonModule, MaterialModule, Card, FormsModule, ReactiveFormsModule, SmartTable],
  templateUrl: './products.html',
  styleUrl: './products.scss'
})
export class Products implements OnInit, AfterViewInit {
  isLoading = true;
  viewStatistics = false;
  viewSearch = false;
  viewFilters = false;
  viewEditStock = false;
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
        class: 'relative',
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
        name: 'Stock',
        key: 'stock',
        canFilter: false,
        canSort: true,
        filter: '',
        show: true,
        class: 'text-right font-bold',
      },
      {
        name: 'Contenido por unidad',
        key: 'size_per_unit',
        canFilter: false,
        canSort: true,
        filter: '',
        show: true,
        class: 'text-right',
      },
      {
        name: 'Unidad',
        key: 'unit',
        canFilter: false,
        canSort: true,
        filter: '',
        show: true,
        class: 'relative',
      },
      {
        name: 'Categoría',
        key: 'category.name',
        canFilter: false,
        canSort: false,
        filter: '',
        show: true,
        class: 'text-gray-600',
      }
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
      possibleKeys: ['Descripción', 'descripcion', 'Description', 'description', 'DESCRIPCIÓN']
    },
    {
      key: 'price',
      label: 'Precio',
      required: true,
      type: 'number',
      possibleKeys: ['Precio', 'precio', 'Price', 'price', 'PRECIO']
    },
    {
      key: 'stock',
      label: 'Stock',
      required: false,
      type: 'integer',
      possibleKeys: ['Stock', 'stock', 'STOCK', 'Inventario', 'inventario']
    },
    {
      key: 'unit',
      label: 'Unidad',
      required: false,
      type: 'string',
      possibleKeys: ['Unidad', 'unidad', 'Unit', 'unit', 'UNIDAD']
    },
    {
      key: 'size_per_unit',
      label: 'Contenido por unidad',
      required: false,
      type: 'string',
      possibleKeys: ['Contenido por unidad', 'Contenido', 'contenido por unidad', 'contenido']
    },
    {
      key: 'remain_unit',
      label: 'Restante ultimo envase',
      required: false,
      type: 'string',
      possibleKeys: ['Restante ultimo envase', 'Restante', 'RESTANTE', 'remain', 'Remain']
    },
    {
      key: 'category',
      label: 'Categoría',
      required: false,
      type: 'string',
      possibleKeys: ['Categoría', 'categoria', 'Category', 'category', 'CATEGORÍA']
    }
  ];

  sortColumn: string = '';
  sortDirection: string = '';

  pageSize = 20;
  pageIndex = 0;
  pageLe = 0;

  products: Product[] = []

  @ViewChild('codeCell') codeCell!: TemplateRef<any>;
  @ViewChild('stockCell') stockCell!: TemplateRef<any>;
  @ViewChild('priceCell') priceCell!: TemplateRef<any>;

  cellTemplates: { [key: string]: TemplateRef<any> } = {};

  showImportHelp = false;

  constructor(private productSvc: ProductService, private dialog: MatDialog,
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
      code: this.codeCell,
      stock: this.stockCell,
      price: this.priceCell
    };
  }

  loadData() {
    this.isLoading = true;
    const where = buildWhere(this.result.global, this.result.headers);
    this.productSvc.getProducts(where, this.pageIndex, this.pageSize, this.sortColumn, this.sortDirection)
      .subscribe(res => {
        this.isLoading = false;
        this.products = res.content;
        this.pageSize = res.size;
        this.pageIndex = res.number;
        this.pageLe = res.total_elements;
      });
  }

  updateStock(add: boolean, i: Product) {
    if (add) {
      if (i.uuid) {
        const actual = Number(`${i.stock ?? 0}`)
        i.stock = actual + 1
        this.productSvc.updateProduct(i.uuid, {
          stock: actual + 1
        }).subscribe({
          next: (res) => {
            // opcional: mostrar success, actualizar lista, etc.
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'No se ha podido cambiar el stock',
              text: err?.error?.message || 'Porfavor verifique su conexión a internet o intentelo más tarde',
            });
            i.stock = actual
          }
        });
      }
    } else {
      const product = i
      if (product.uuid) {
        const actual = Number(`${product.stock ?? 0}`)
        if (actual == 0) {
          return;
        }
        i.stock = actual - 1
        this.productSvc.updateProduct(product.uuid, {
          stock: actual - 1
        }).subscribe({
          next: (res) => {
            // opcional: mostrar success, actualizar lista, etc.
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'No se ha podido cambiar el stock',
              text: err?.error?.message || 'Porfavor verifique su conexión a internet o intentelo más tarde',
            });
            i.stock = actual
          }
        });
      }
    }
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadData();
  }

  getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  }

  onEditProduct(product: Product) {
    this.openProductModal(product);
  }

  onDeleteProduct(product: Product) {
    Swal.fire({
      title: '¿Está seguro que desea borrar el producto?',
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
        this.productSvc.deleteProduct(product.uuid!).subscribe({
          next: (res) => {
            Swal.fire({
              icon: 'success',
              title: 'Producto eliminado!',
              text: 'El producto ha sido eliminado del sistema correctamente.',
            });
            this.loadData();
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'No se ha podido eliminar el producto',
              text: err?.error?.message || 'Porfavor verifique su conexión a internet o intentelo más tarde',
            });
          }
        });
      }
    });
  }

  openProductModal(product?: Product) {
    const ref = this.dialog.open(ProductForm, {
      width: '600px',
      data: product ?? null
    });

    ref.afterClosed().subscribe(() => {
      this.loadData();
    })
  }


  exportToExcel() {
    // Preparar los datos para la exportación
    const exportData = this.products.map(product => ({
      'Código': product.code || '',
      'Nombre': product.name || '',
      'Descripción': product.description || '',
      'Precio': product.price || 0,
      'Stock': product.stock || 0,
      'Unidad': product.unit || '',
      'Contenido por unidad': product.size_per_unit || 0,
      'Restante ultimo envase': product.remain_unit || 0,
      'Categoría': this.getValueByPath(product, 'category.name') || ''
    }));

    this.excelService.exportToExcel(
      exportData,
      'productos',
      'Productos'
    );
  }

  async importFromExcel(event: any) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    try {
      // Obtener todos los productos existentes para validar duplicados
      const response = await this.productSvc.getProducts('-', 0, 9999, '', '').toPromise();
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
      const shouldProceed = await this.excelService.showImportSummary(validationResult, 'productos');

      if (shouldProceed) {
        // Ejecutar la importación
        const importResult = await this.excelService.executeImport(
          validationResult.validData,
          (product: Product) => this.productSvc.createProduct(product).toPromise(),
          'productos'
        );

        // Mostrar resultado
        this.excelService.showImportResult(importResult, 'productos');

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
        entityName: 'productos',
        templateFileName: 'plantilla_importar_productos',
        exampleData: [
          {
            'Nombre': 'Producto Ejemplo 1',
            'Descripción': 'Descripción del producto ejemplo',
            'Precio': 25.99,
            'Stock': 100,
            'Unidad': 'ml',
            'Categoría': 'Categoría Ejemplo',
            'Contenido por unidad': 300,
            'Restante ultimo envase': 200,
          },
          {
            'Nombre': 'Producto Ejemplo 2',
            'Descripción': 'Otra descripción de ejemplo',
            'Precio': 15.50,
            'Stock': 50,
            'Unidad': 'gr',
            'Categoría': 'Otra Categoría',
            'Contenido por unidad': 500,
            'Restante ultimo envase': 150,
          }
        ]
      }
    });
  }

}