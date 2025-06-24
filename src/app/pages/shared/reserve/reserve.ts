import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material/material-module';
import { FormsModule } from '@angular/forms';
import { LoginRequest } from '../../../interfaces/auth.interface';
import { AuthService } from '../../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BarberShopService } from '../../../services/barbershop.service';
import { BarberShop } from '../../../interfaces/barbershop.interface';
import { ClientAppointment } from '../../../interfaces/appointment.interface';
import Swal from 'sweetalert2';
import { ServiceService } from '../../../services/service.service';
import { Service } from '../../../interfaces/service.interface';

@Component({
  selector: 'app-reserve',
  imports: [CommonModule, MaterialModule, FormsModule],
  templateUrl: './reserve.html',
  styleUrl: './reserve.css'
})
export class Reserve implements OnInit {

  id: string | null = null;
  barber: BarberShop = {}

  reserve: ClientAppointment = {}

  services: Service[] = []

  isLoading = false

  constructor(
    private route: ActivatedRoute,
    private barSvc: BarberShopService,
    private serviceService: ServiceService,
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.barSvc.get(this.id).subscribe((res => {
        if (res) {
          this.barber = res
          this.serviceService.getServicesClient(res.uuid!!).subscribe((res2)=>{
            if(res2){
              this.services = res2.content
            }
          })
        }
      }))
    }
  }

  onsubmit() {
    this.isLoading = true;
    if (!this.reserve.name || !this.reserve.date || !this.reserve.hour || !this.reserve.dni) {
      Swal.fire({
        icon: 'error',
        title: 'Faltan campos',
        text: 'Porfavor Rellene todos los campos marcados con (*)',
      });
      this.isLoading = false;
      return;
    }

    

  }
}
