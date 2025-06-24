import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material/material-module';
import { AppointmentService } from '../../../services/appointment.service';
import { Appointment, CalendarResponse } from '../../../interfaces/appointment.interface';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AppointmentForm } from '../../shared/forms/appointment-form/appointment-form';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-appointments',
  imports: [CommonModule, MaterialModule, FormsModule],
  templateUrl: './appointments.html',
  styleUrl: './appointments.scss'
})
export class Appointments implements OnInit {

  diary: [CalendarResponse[]] = [[]]
  diaryByDate: CalendarResponse | null = null;

  typeDate = 'month'
  myDate = new Date();
  actualDay = this.myDate.getDate()
  actualMonth = this.myDate.getMonth()
  actualYear = this.myDate.getFullYear()

  today = new Date();
  link = ''


  constructor(private appSvc: AppointmentService, private dialog: MatDialog, private authSvc: AuthService) { }

  ngOnInit(): void {
    const user = this.authSvc.getCurrentUser()
    this.link = `localhost:4200/reserve/${user?.barbershop_code}`
    this.getByMonth();
    this.getByDay();
  }

  get todayString(): string {
    return this.today.toISOString().substring(0, 10);
  }

  isToday(dateString: string): boolean {
    return dateString?.substring(0, 10) === this.todayString;
  }

  copied = false;

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.copied = true;
      setTimeout(() => this.copied = false, 2000); // Oculta después de 2s
    }).catch(err => {
      console.error('Error al copiar:', err);
    });
  }

  getByMonth() {
    this.appSvc.getCalendarByMonth(this.actualMonth + 1, this.actualYear).subscribe(res => {
      if (res) {
        this.diary = res
      }
    })
  }

  getByDay() {
    this.appSvc.getCalendarByDay(this.actualDay, this.actualMonth + 1, this.actualYear).subscribe(res => {
      if (res) {
        this.diaryByDate = res
      }
    })
  }

  moveDate(after: boolean) {
    switch (this.typeDate) {
      case 'month': {
        this.moveMonth(after);
        break;
      }
      case 'day': {
        this.moveDay(after);
        break;
      }
      default: {
        break;
      }
    }

    this.getByMonth()
  }

  moveDay(after: boolean) {
    var newDate = new Date()
    newDate.setDate(this.actualDay)
    newDate.setMonth(this.actualMonth)
    newDate.setFullYear(this.actualYear)

    var nextDate = new Date()

    if (after) {
      nextDate = new Date(newDate.getTime() + (86400000));
    } else {
      nextDate = new Date(newDate.getTime() - (86400000));
    }
    this.actualDay = nextDate.getDate()
    this.actualMonth = nextDate.getMonth()
    this.actualYear = nextDate.getFullYear()
    this.getByDay()
  }

  moveMonth(after: boolean) {
    if (after) {
      if (this.actualMonth == 11) {
        this.actualMonth = 0
        this.actualYear += 1
      } else {
        this.actualMonth += 1
      }
    } else {
      if (this.actualMonth == 0) {
        this.actualMonth = 11
        this.actualYear -= 1
      } else {
        this.actualMonth -= 1
      }
    }
    this.getByMonth()
  }

  createApp(can: boolean, day?: CalendarResponse) {
    if (!can && day) {
      const ref = this.dialog.open(AppointmentForm, {
        data: {
          scheduled_at: day.total_day
        }
      })
      ref.afterClosed().subscribe(() => {
        this.getByMonth()
        this.getByDay()
      })
    }
  }

  editApp(app: Appointment) {
    const ref = this.dialog.open(AppointmentForm, {
      data: app
    })
    ref.afterClosed().subscribe(() => {
      this.getByMonth()
      this.getByDay()
    })
  }

  formatDate(value: any): string {
    if (value == null) return '';
    const date = new Date(value);
    return `${date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })}`;
  }

  getBg(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-500'
      case 'CONFIRMED':
        return 'bg-green-600'
      case 'PASSED':
        return 'bg-red-500'
      case 'COMPLETED':
        return 'bg-primary'
      default:
        return 'bg-gray-600'
    }
  }
}
