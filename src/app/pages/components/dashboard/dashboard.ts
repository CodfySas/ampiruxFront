import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material/material-module';
import { Card } from "../../shared/card/card";

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, MaterialModule, Card],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  isLoading = true;

  ngOnInit(): void {
    this.isLoading = false;
  }
}
