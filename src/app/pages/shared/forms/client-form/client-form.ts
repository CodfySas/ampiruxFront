import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { Client } from '../../../../interfaces/client.interface';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../../material/material-module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClientService } from '../../../../services/client.service';

@Component({
  selector: 'app-client-form',
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, FormsModule],
  templateUrl: './client-form.html',
  styleUrl: './client-form.scss'
})
export class ClientForm {
new: Client = {}

  isLoading = true;

  constructor(private clientSvc: ClientService, private dialogRef: MatDialogRef<ClientForm>,
    @Inject(MAT_DIALOG_DATA) public data: Client | null
  ) { }

  ngOnInit(): void {
    if (this.data) {
      this.new = this.data
    }
    this.isLoading = false;
  }

  onSave() {
    this.isLoading = true;
    if (!this.new.name || this.new.name == "" || !this.new.dni || this.new.dni == "") {
      Swal.fire({
        icon: 'error',
        title: 'Faltan campos',
        text: 'Porfavor Rellene todos los campos marcados con (*)',
      });
      this.isLoading = false;
      return;
    }

    if (this.data?.uuid) {
      this.clientSvc.updateClient(this.data.uuid!, this.new).subscribe({
        next: (res) => {
          Swal.fire({
            icon: 'success',
            title: 'Cliente editado!',
            text: 'El Cliente se ha editado exitosamente',
          });
          this.onClose()
          this.isLoading = false;
          return;
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'No se ha podido editar el cliente',
            text: err?.error?.message || 'Porfavor verifique su conexión a internet o intentelo más tarde',
          });
          this.isLoading = false;
          return;
        }
      })
    } else {
      this.clientSvc.createClient(this.new).subscribe({
        next: (res) => {
          Swal.fire({
            icon: 'success',
            title: 'Cliente creado!',
            text: 'El Cliente se ha creado exitosamente',
          });
          this.dialogRef.close(res);
          this.isLoading = false;
          return;
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'No se ha podido crear el cliente',
            text: err?.error?.message || 'Porfavor verifique su conexión a internet o intentelo más tarde',
          });
          this.isLoading = false;
          return;
        }
      })
    }
  }

  onClose() {
    this.dialogRef.close(this.new);
  }
}
