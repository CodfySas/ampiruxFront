import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { MaterialModule } from '../../../../material/material-module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Commission } from '../../../../interfaces/commission.interface';
import { CommissionService } from '../../../../services/commission.service';
import { Barber } from '../../../../interfaces/barber.interface';
import { PageEvent } from '@angular/material/paginator';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-commission-form',
  imports: [CommonModule, MaterialModule],
  templateUrl: './commission-form.html',
  styleUrl: './commission-form.scss'
})
export class CommissionForm implements OnInit, AfterViewInit {
  isLoading = true;

  pageSize = 20;
  pageIndex = 0;
  pageLe = 0;

  commissions: Commission[] = []

  constructor(@Inject(MAT_DIALOG_DATA) public data: Barber | null, private dialogRef: MatDialogRef<CommissionForm>, private commissionSvc: CommissionService) { }

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const el = document.activeElement as HTMLElement;
      if (el && el.tagName.toLowerCase().includes('mat-paginator')) {
        el.blur();
      }
    });
  }

  loadData() {
    this.isLoading = true;
    if (this.data?.uuid) {
      this.commissionSvc.getHistory(this.data.uuid, this.pageIndex, this.pageSize).subscribe((res) => {
        if (res) {
          this.isLoading = false;
          this.commissions = res.content
          this.pageSize = res.size;
          this.pageIndex = res.number;
          this.pageLe = res.total_elements;
        }
      })
    } else {
      this.isLoading = false
    }
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadData();
  }

  formatSalary(value: any): string {
    if (value == null) return '$0';
    return '$' + value.toLocaleString('es-CO');
  }

  formatDate(date: string): string {
    if (date == '') return '';
    const newdate = new Date(date);
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return newdate.toLocaleDateString('es-CO', options).toLowerCase();
  }

  onClose() {
    this.dialogRef.close();
  }

  payCommissions() {
    if (this.data) {
      Swal.fire({
        title: 'Pagar comisiones',
        text: `¿Pagar todas las comisiones pendientes de ${this.data.name}?`,
        icon: 'question',
        reverseButtons: true,
        showCancelButton: true,
        confirmButtonColor: '#00dd22',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, Pagar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.commissionSvc.payCommissions(this.data?.uuid!).subscribe({
            next: (res) => {
              Swal.fire({
                icon: 'success',
                title: 'Comisiones Pagadas!',
                text: `Se han pagado todas las comisiones de ${this.data?.name}.`,
              });
              this.loadData();
              this.data!.pending_commissions = 0;
            },
            error: (err) => {
              Swal.fire({
                icon: 'error',
                title: 'No se ha podido pagar',
                text: err?.error?.message || 'Porfavor verifique su conexión a internet o intentelo más tarde',
              });
            }
          });
        }
      });
    }

  }
}
