import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output, TemplateRef } from "@angular/core";
import { MaterialModule } from "../../../material/material-module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TableSortHeader } from "../table-sort-header/table-sort-header";
import { PageEvent } from "@angular/material/paginator";
import { Header } from "../../../interfaces/base.interface";
import { Product } from "../../../interfaces/product.interface";

@Component({
  selector: 'app-smart-table',
  templateUrl: './smart-table.html',
  styleUrls: ['./smart-table.scss'],
  standalone: true,
  imports: [CommonModule, MaterialModule, FormsModule, ReactiveFormsModule, TableSortHeader]
})
export class SmartTable {
  @Input() headers: Header[] = [];
  @Input() data: any[] = [];
  @Input() pageSize = 20;
  @Input() pageIndex = 0;
  @Input() sortColumn = '';
  @Input() sortDirection = '';
  @Input() loading = false;
  @Input() pMode = 2;
  @Input() showFilters = false;
  @Input() showEditStock = false;
  @Input() sale = false;
  @Input() saleCompleted = false;

  @Input() cellTemplate?: TemplateRef<any>; // para una sola plantilla global
  @Input() cellTemplates?: { [key: string]: TemplateRef<any> };

  @Output() filtersChange = new EventEmitter<void>();
  @Output() sortChange = new EventEmitter<{ column: string; direction: string }>();
  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() globalFilterChange = new EventEmitter<string>();
  @Output() editItem = new EventEmitter<any>();
  @Output() payItem = new EventEmitter<any>();
  @Output() viewItem = new EventEmitter<any>();
  @Output() printItem = new EventEmitter<any>();
  @Output() deleteItem = new EventEmitter<any>();

  getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  }

  onSortChange({ column, direction }: { column: string, direction: string }) {
    this.sortChange.emit({ column, direction });
  }


  onPageChange(event: PageEvent) {
    this.pageChange.emit(event);
  }

  onGlobalChange(value: string) {
    this.globalFilterChange.emit(value);
  }

  onEditItem(item: any) {
    this.editItem.emit(item);
  }

  onPayItem(item: any) {
    this.payItem.emit(item);
  }

  onViewItem(item: any) {
    this.viewItem.emit(item);
  }

  onPrintItem(item: any) {
    this.printItem.emit(item);
  }

  onDeleteItem(item: any) {
    this.deleteItem.emit(item);
  }
}
