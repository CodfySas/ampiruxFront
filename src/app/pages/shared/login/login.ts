import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MaterialModule } from '../../../material/material-module';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [CommonModule, MaterialModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

}
