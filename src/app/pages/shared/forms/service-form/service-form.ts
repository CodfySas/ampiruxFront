import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { Service, ServiceDefaultProduct } from '../../../../interfaces/service.interface';
import { ServiceService } from '../../../../services/service.service';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../../material/material-module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../../../services/product.service';
import { Product } from '../../../../interfaces/product.interface';

@Component({
  selector: 'app-service-form',
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, FormsModule],
  templateUrl: './service-form.html',
  styleUrl: './service-form.scss'
})
export class ServiceForm {
  new: Service = {}
  products: Product[] = []
  filteredProducts: Product[] = []
  searchTerm: string = ''
  isLoading = true;

  constructor(private catSvc: ServiceService, private dialogRef: MatDialogRef<ServiceForm>,
    @Inject(MAT_DIALOG_DATA) public data: Service | null, private productSvc: ProductService
  ) { }

  ngOnInit(): void {
    if (this.data) {
      this.new = { ...this.data }
      if (!this.new.default_products) {
        this.new.default_products = []
      }
    } else {
      this.new.default_products = []
    }
    this.productSvc.getProducts('-', 0, 999999).subscribe((p)=> this.products = p.content)
    this.isLoading = false;
  }

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
    const exists = this.new.default_products?.find(dp => dp.product_uuid === product.uuid)
    if (exists) {
      Swal.fire({
        icon: 'warning',
        title: 'Producto ya agregado',
        text: 'Este producto ya está en la lista',
      });
      return
    }

    const newDefaultProduct: ServiceDefaultProduct = {
      product_uuid: product.uuid,
      quantity: 1,
      unit: 'unidad',
      cost_type: 'cortesy'
    }

    this.new.default_products?.push(newDefaultProduct)
  }

  removeProduct(index: number) {
    this.new.default_products?.splice(index, 1)
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
    if (!this.new.name || this.new.name == "") {
      Swal.fire({
        icon: 'error',
        title: 'Faltan campos',
        text: 'Porfavor Rellene todos los campos marcados con (*)',
      });
      this.isLoading = false;
      return;
    }

    if (this.data) {
      this.catSvc.updateService(this.data.uuid!, this.new).subscribe({
        next: (res) => {
          Swal.fire({
            icon: 'success',
            title: 'Servicio editado!',
            text: 'El Servicio se ha editado exitosamente',
          });
          this.onClose()
          this.isLoading = false;
          return;
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'No se ha podido editar el servicio',
            text: err?.error?.message || 'Porfavor verifique su conexión a internet o intentelo más tarde',
          });
          this.isLoading = false;
          return;
        }
      })
    } else {
      this.catSvc.createService(this.new).subscribe({
        next: (res) => {
          Swal.fire({
            icon: 'success',
            title: 'Servicio creado!',
            text: 'El Servicio se ha creado exitosamente',
          });
          this.onClose()
          this.isLoading = false;
          return;
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'No se ha podido crear el servicio',
            text: err?.error?.message || 'Porfavor verifique su conexión a internet o intentelo más tarde',
          });
          this.isLoading = false;
          return;
        }
      })
    }
  }

  onClose() {
    this.dialogRef.close();
  }
}