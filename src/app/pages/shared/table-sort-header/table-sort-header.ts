import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MaterialModule } from '../../../material/material-module';

@Component({
  selector: 'app-table-sort-header',
  imports: [CommonModule, MaterialModule],
  templateUrl: './table-sort-header.html',
  styleUrl: './table-sort-header.scss'
})
export class TableSortHeader {
  @Input() label: string = '';
  @Input() column: string = '';
  @Input() active: boolean = false;
  @Input() direction: string = '';

  @Output() sortChange = new EventEmitter<{ column: string, direction: string }>();

  onToggleSort() {
    let newDirection = '';
    let newColumn = this.column;
    if (this.active) {
    if (this.direction === 'asc') {
      newDirection = 'desc';
    } else if (this.direction === 'desc') {
      newDirection = '';
      newColumn = '';
    } else {
      newDirection = 'asc';
    }
  } else {
    newDirection = 'asc';
  }

    this.sortChange.emit({ column: newColumn, direction: newDirection });
  }
}
