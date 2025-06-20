import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Inject, Input, OnInit, Output } from "@angular/core";
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Product, ProductCategory } from "../../../../interfaces/product.interface";
import { MaterialModule } from "../../../../material/material-module";
import { ProductService } from "../../../../services/product.service";
import Swal from "sweetalert2";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.html',
  styleUrls: ['./product-form.scss'],
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, FormsModule]
})
export class ProductForm implements OnInit {
  productNew: Product = {}

  categories: ProductCategory[] = [];

  isLoading = true;

  constructor(private fb: FormBuilder, private productSvc: ProductService, private dialogRef: MatDialogRef<ProductForm>,
      @Inject(MAT_DIALOG_DATA) public product: Product | null
  ) { }

  ngOnInit(): void {
    if (this.product) {
      this.productNew = this.product
    }
    this.isLoading = false;

    this.productSvc.getCategories().subscribe(categories => {
      this.categories = categories.content;
    });
  }

  onSave() {
    this.isLoading = true;
    if (!this.productNew.name || this.productNew.name == "") {
      Swal.fire({
        icon: 'error',
        title: 'Faltan campos',
        text: 'Porfavor Rellene todos los campos marcados con (*)',
      });
      this.isLoading = false;
      return;
    }

    if (this.product) {
      this.productSvc.updateProduct(this.product.uuid!, this.productNew).subscribe({
        next: (res) => {
          Swal.fire({
            icon: 'success',
            title: 'Producto editado!',
            text: 'El producto se ha editado exitosamente',
          });
          this.onClose()
          this.isLoading = false;
          return;
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'No se ha podido editar el producto',
            text: err?.error?.message || 'Porfavor verifique su conexión a internet o intentelo más tarde',
          });
          this.isLoading = false;
          return;
        }
      })
    } else {
      this.productSvc.createProduct(this.productNew).subscribe({
        next: (res) => {
          Swal.fire({
            icon: 'success',
            title: 'Producto creado!',
            text: 'El producto se ha creado exitosamente',
          });
          this.onClose()
          this.isLoading = false;
          return;
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'No se ha podido crear el producto',
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

  updateStock(add: boolean) {
    if (add) {
      this.productNew.stock = (this.productNew.stock ?? 0) + 1
    } else {
      if ((this.productNew.stock ?? 0) > 0) {
        this.productNew.stock = (this.productNew.stock ?? 0) - 1
      }
    }
  }
}
