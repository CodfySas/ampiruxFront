import { Component, Inject } from '@angular/core';
import { ProductCategory } from '../../../../interfaces/product.interface';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { ProductForm } from '../product-form/product-form';
import { CategoryService } from '../../../../services/product-category.service';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../../material/material-module';

@Component({
  selector: 'app-category-form',
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, FormsModule],
  templateUrl: './category-form.html',
  styleUrl: './category-form.scss'
})
export class CategoryForm {
  new: ProductCategory = {}

  categories: ProductCategory[] = [];

  isLoading = true;

  constructor(private catSvc: CategoryService, private dialogRef: MatDialogRef<ProductForm>,
    @Inject(MAT_DIALOG_DATA) public data: ProductCategory | null
  ) { }

  ngOnInit(): void {
    if (this.data) {
      this.new = this.data
    }
    this.isLoading = false;
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
      this.catSvc.updateProductCategory(this.data.uuid!, this.new).subscribe({
        next: (res) => {
          Swal.fire({
            icon: 'success',
            title: 'Categoria editada!',
            text: 'La categoria se ha editado exitosamente',
          });
          this.onClose()
          this.isLoading = false;
          return;
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'No se ha podido editar la categoría',
            text: err?.error?.message || 'Porfavor verifique su conexión a internet o intentelo más tarde',
          });
          this.isLoading = false;
          return;
        }
      })
    } else {
      this.catSvc.createProductCategory(this.new).subscribe({
        next: (res) => {
          Swal.fire({
            icon: 'success',
            title: 'Categoría creada!',
            text: 'La categoría se ha creado exitosamente',
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
}
