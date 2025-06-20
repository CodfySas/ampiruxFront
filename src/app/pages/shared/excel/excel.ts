import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaterialModule } from '../../../material/material-module';
import { ExcelService, ExcelColumn } from '../../../services/excel.service';

export interface ExcelHelpData {
  columns: ExcelColumn[];
  entityName: string;
  templateFileName: string;
  exampleData?: any[];
}

@Component({
  selector: 'app-excel-help-modal',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `
    <div class="p-8 max-h-[80vh] overflow-y-auto">
      <div class="flex items-center mb-4">
        <mat-icon class="mr-2 text-blue-600">help_outline</mat-icon>
        <h2 class="text-xl font-semibold">Formato para importación Excel</h2>
      </div>
      
      <div class="mb-4">
        <p class="text-gray-700 mb-3">El archivo Excel debe contener las siguientes columnas:</p>
        <ul class="list-disc ml-6 space-y-2">
          <li *ngFor="let column of data.columns">
            <strong>{{ column.label }}</strong>
            <span *ngIf="column.required" class="text-red-500 ml-1">(obligatorio)</span>
            <span *ngIf="column.type" class="text-gray-500 ml-1">({{ getTypeDescription(column.type) }})</span>
            <div *ngIf="column.possibleKeys && column.possibleKeys.length > 1" class="text-sm text-gray-600 ml-2">
              También acepta: {{ getAlternateKeys(column) }}
            </div>
          </li>
        </ul>
      </div>

      <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <mat-icon class="text-blue-400">info</mat-icon>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-blue-800">Consejos importantes:</h3>
            <div class="mt-2 text-sm text-blue-700">
              <ul class="list-disc ml-4 space-y-1">
                <li>La primera fila debe contener los nombres de las columnas</li>
                <li>No deje filas vacías entre los datos</li>
                <li>Los campos marcados como obligatorios no pueden estar vacíos</li>
                <li>Los números no deben contener caracteres especiales (excepto punto decimal)</li>
                <li>Se omitirán automáticamente los registros duplicados</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-between items-center mt-6">
        <div class="flex gap-2">
          <button mat-button (click)="closeModal()">
            Cerrar
          </button>
        </div>
        <button 
          mat-raised-button
          matButton="filled"
          color="primary" 
          (click)="downloadTemplate()">
          <mat-icon>download</mat-icon>
          Descargar Plantilla
        </button>
        
        
      </div>
    </div>
  `
})
export class ExcelHelpModalComponent {

  constructor(
    public dialogRef: MatDialogRef<ExcelHelpModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ExcelHelpData,
    private excelService: ExcelService
  ) { }

  getTypeDescription(type: string): string {
    switch (type) {
      case 'number':
        return 'número decimal';
      case 'integer':
        return 'número entero';
      case 'string':
      default:
        return 'texto';
    }
  }

  getAlternateKeys(column: ExcelColumn): string {
  const join = column.possibleKeys?.filter(k => k !== column.key && k !== column.label)
    .join(', ');
    return join ? join : ''
}

  downloadTemplate() {
    this.excelService.createTemplate(
      this.data.columns,
      this.data.templateFileName,
      this.data.exampleData
    );
  }

  closeModal() {
    this.dialogRef.close();
  }
}