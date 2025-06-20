import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { Barber } from '../../../../interfaces/barber.interface';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../../material/material-module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BarberService } from '../../../../services/barber.service';

@Component({
  selector: 'app-barber-form',
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, FormsModule],
  templateUrl: './barber-form.html',
  styleUrl: './barber-form.scss'
})
export class BarberForm {
new: Barber = {}

  isLoading = true;

  constructor(private barberSvc: BarberService, private dialogRef: MatDialogRef<BarberForm>,
    @Inject(MAT_DIALOG_DATA) public data: Barber | null
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
      this.barberSvc.updateBarber(this.data.uuid!, this.new).subscribe({
        next: (res) => {
          Swal.fire({
            icon: 'success',
            title: 'Empleado editado!',
            text: 'El Empleado se ha editado exitosamente',
          });
          this.onClose()
          this.isLoading = false;
          return;
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'No se ha podido editar el empleado',
            text: err?.error?.message || 'Porfavor verifique su conexión a internet o intentelo más tarde',
          });
          this.isLoading = false;
          return;
        }
      })
    } else {
      this.barberSvc.createBarber(this.new).subscribe({
        next: (res) => {
          Swal.fire({
            icon: 'success',
            title: 'Empleado creado!',
            text: 'El Empleado se ha creado exitosamente',
          });
          this.onClose()
          this.isLoading = false;
          return;
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'No se ha podido crear el empleado',
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
