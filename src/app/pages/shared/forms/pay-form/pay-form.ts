import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MaterialModule } from '../../../../material/material-module';
import { Sale } from '../../../../interfaces/sale.interface';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { SaleService } from '../../../../services/sale.service';
import Swal from 'sweetalert2';
import { SaleForm } from '../sale-form/sale-form';

@Component({
  selector: 'app-pay-form',
  imports: [CommonModule, MaterialModule, FormsModule],
  templateUrl: './pay-form.html',
  styleUrl: './pay-form.scss'
})
export class PayForm implements OnInit {
  isLoading = true;
  new: Sale = {}

  constructor(@Inject(MAT_DIALOG_DATA) public data: Sale | null, private dialogRef: MatDialogRef<PayForm>, private saleService: SaleService, private dialog: MatDialog) { }

  ngOnInit(): void {
    if (this.data) {
      this.new = { ...this.data };
    }
    this.isLoading = false;
  }

  viewSale() {
    this.dialog.open(SaleForm, {
      data: { ...this.new, read: true },
      height: '90vh',
    })
  }

  onClose() {
    this.dialogRef.close();
  }

  onSave() {
    if (!this.new.payment_method || this.new.payment_method == '') {
      Swal.fire({
        icon: 'error',
        title: 'Faltan campos',
        text: 'porfavor asigne el método de pago',
      });
      this.isLoading = false;
      return;
    }
    if (this.data) {
      this.new.status = 'PAID'
      this.saleService.updateSale(this.data.uuid!, this.new).subscribe({
        next: (res) => {
          Swal.fire({
            icon: 'success',
            title: 'Venta Pagada!',
            text: 'La venta se ha pagado exitosamente',
          });
          this.onClose()
          this.isLoading = false;
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'No se ha podido pagar la Venta',
            text: err?.error?.message || 'Por favor verifique su conexión a internet o inténtelo más tarde',
          });
          this.isLoading = false;
        }
      })
    }
  }
}
