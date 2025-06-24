import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

export interface ExcelColumn {
  key: string;
  label: string;
  required?: boolean;
  type?: 'string' | 'number' | 'integer';
  possibleKeys?: string[]; // Para mapear diferentes nombres de columnas
}

export interface ExcelValidationResult {
  validData: any[];
  errors: string[];
  duplicates: string[];
  totalRows: number;
}

export interface ExcelImportConfig {
  columns: ExcelColumn[];
  allowDuplicates?: boolean;
  existingData?: any[]; // Para validar duplicados
  duplicateKey?: string; // Clave para validar duplicados (ej: 'name')
}

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor() { }

  /**
   * Exporta datos a Excel
   */
  exportToExcel(
    data: any[],
    fileName: string,
    sheetName: string = 'Datos',
    showSuccessMessage: boolean = true
  ): void {
    if (!data || data.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin datos',
        text: 'No hay datos para exportar.',
      });
      return;
    }

    try {
      // Crear el workbook y worksheet
      const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

      Object.keys(ws).forEach((cell) => {
        const cellValue = ws[cell].v;
        if (typeof cellValue === 'string' && cellValue.includes('\n')) {
          if (!ws[cell].s) ws[cell].s = {};
          ws[cell].s.alignment = { wrapText: true };
        }
      });

      const wb: XLSX.WorkBook = XLSX.utils.book_new();

      // Agregar la hoja al workbook
      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      // Generar el nombre del archivo con fecha si no incluye fecha
      let finalFileName = fileName;
      if (!fileName.includes('_')) {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
        finalFileName = `${fileName}_${dateStr}.xlsx`;
      } else if (!fileName.endsWith('.xlsx')) {
        finalFileName = `${fileName}.xlsx`;
      }

      // Descargar el archivo
      XLSX.writeFile(wb, finalFileName);

      // Mostrar mensaje de éxito
      if (showSuccessMessage) {
        Swal.fire({
          icon: 'success',
          title: 'Exportación exitosa',
          text: `Los datos han sido exportados a ${finalFileName}`,
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al exportar',
        text: 'No se pudo generar el archivo Excel.',
      });
    }
  }

  /**
   * Importa y valida datos desde Excel
   */
  async importFromExcel(
    file: File,
    config: ExcelImportConfig
  ): Promise<ExcelValidationResult | null> {

    return new Promise((resolve, reject) => {
      // Verificar que sea un archivo Excel
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];

      if (!validTypes.includes(file.type)) {
        Swal.fire({
          icon: 'error',
          title: 'Archivo inválido',
          text: 'Por favor seleccione un archivo Excel (.xlsx o .xls)',
        });
        resolve(null);
        return;
      }

      const reader = new FileReader();

      reader.onload = (e: any) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });

          // Tomar la primera hoja
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // Convertir a JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (jsonData.length === 0) {
            Swal.fire({
              icon: 'warning',
              title: 'Archivo vacío',
              text: 'El archivo Excel no contiene datos para importar.',
            });
            resolve(null);
            return;
          }

          // Validar los datos
          const validationResult = this.validateImportData(jsonData, config);
          resolve(validationResult);

        } catch (error) {
          console.error('Error al leer el archivo:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error al leer el archivo',
            text: 'No se pudo procesar el archivo Excel. Verifique que el formato sea correcto.',
          });
          resolve(null);
        }
      };

      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Valida los datos importados
   */
  private validateImportData(
    data: any[],
    config: ExcelImportConfig
  ): ExcelValidationResult {
    const validData: any[] = [];
    const errors: string[] = [];
    const duplicates: string[] = [];

    // Procesar cada fila del Excel
    data.forEach((row: any, index: number) => {
      const rowNumber = index + 2; // +2 porque empieza en fila 2 (después del header)
      const processedRow: any = {};
      let hasErrors = false;

      // Procesar cada columna definida en la configuración
      config.columns.forEach(column => {
        const value = this.getExcelValue(row, column.possibleKeys || [column.key, column.label]);

        // Validar campos requeridos
        if (column.required && (!value || value.toString().trim() === '')) {
          errors.push(`Fila ${rowNumber}: ${column.label} es obligatorio`);
          hasErrors = true;
          return;
        }

        // Validar tipos de datos
        if (value !== null && value !== undefined && value !== '') {
          if (column.type === 'number') {
            const numericValue = parseFloat(value.toString());
            if (isNaN(numericValue) || numericValue < 0) {
              errors.push(`Fila ${rowNumber}: ${column.label} debe ser un número válido`);
              hasErrors = true;
              return;
            }
            processedRow[column.key] = numericValue;
          } else if (column.type === 'integer') {
            const intValue = parseInt(value.toString());
            if (isNaN(intValue) || intValue < 0) {
              errors.push(`Fila ${rowNumber}: ${column.label} debe ser un número entero válido`);
              hasErrors = true;
              return;
            }
            processedRow[column.key] = intValue;
          } else {
            processedRow[column.key] = value.toString().trim();
          }
        } else {
          processedRow[column.key] = column.type === 'number' || column.type === 'integer' ? 0 : '';
        }
      });

      if (hasErrors) return;

      // Validar duplicados con datos existentes
      if (!config.allowDuplicates && config.existingData && config.duplicateKey) {
        const duplicateValue = processedRow[config.duplicateKey];
        const existingItem = config.existingData.find(item =>
          item[config.duplicateKey || ""]?.toLowerCase().trim() === duplicateValue?.toLowerCase().trim()
        );

        if (existingItem) {
          duplicates.push(`${duplicateValue} (Fila ${rowNumber})`);
          return;
        }

        // Verificar duplicados en el mismo archivo
        const duplicateInFile = validData.find(item =>
          item[config.duplicateKey || ""]?.toLowerCase().trim() === duplicateValue?.toLowerCase().trim()
        );

        if (duplicateInFile) {
          errors.push(`Fila ${rowNumber}: Elemento duplicado en el archivo - ${duplicateValue}`);
          return;
        }
      }

      validData.push(processedRow);
    });

    return {
      validData,
      errors,
      duplicates,
      totalRows: data.length
    };
  }

  /**
   * Busca un valor en el objeto usando diferentes posibles claves
   */
  private getExcelValue(row: any, possibleKeys: string[]): any {
    for (const key of possibleKeys) {
      if (row.hasOwnProperty(key)) {
        return row[key];
      }
    }
    return null;
  }

  /**
   * Muestra un resumen de la importación y permite al usuario confirmar
   */
  showImportSummary(
    validationResult: ExcelValidationResult,
    entityName: string = 'elementos'
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const { validData, errors, duplicates, totalRows } = validationResult;

      let summaryText = `
        <div style="text-align: left;">
          <strong>Resumen de importación:</strong><br>
          • Total de filas procesadas: ${totalRows}<br>
          • ${entityName} válidos para importar: ${validData.length}<br>
          • ${entityName} duplicados (omitidos): ${duplicates.length}<br>
          • Errores encontrados: ${errors.length}
        </div>
      `;

      if (duplicates.length > 0) {
        summaryText += `<br><strong>${entityName} duplicados:</strong><br>`;
        summaryText += duplicates.slice(0, 5).join('<br>');
        if (duplicates.length > 5) {
          summaryText += `<br>... y ${duplicates.length - 5} más`;
        }
      }

      if (errors.length > 0) {
        summaryText += `<br><br><strong>Errores:</strong><br>`;
        summaryText += errors.slice(0, 5).join('<br>');
        if (errors.length > 5) {
          summaryText += `<br>... y ${errors.length - 5} más`;
        }
      }

      if (validData.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: `No hay ${entityName} para importar`,
          html: summaryText,
        });
        resolve(false);
        return;
      }

      Swal.fire({
        title: '¿Continuar con la importación?',
        html: summaryText,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#732299',
        cancelButtonColor: '#d33',
        confirmButtonText: `Sí, importar ${validData.length} ${entityName}`,
        cancelButtonText: 'Cancelar',
        reverseButtons: true
      }).then((result) => {
        resolve(result.isConfirmed);
      });
    });
  }

  /**
   * Ejecuta la importación de datos
   */
  async executeImport<T>(
    data: any[],
    importFunction: (item: any) => Promise<T>,
    entityName: string = 'elementos'
  ): Promise<{ successCount: number; errorCount: number; errors: string[] }> {

    Swal.fire({
      title: `Importando ${entityName}...`,
      text: `Creando ${data.length} ${entityName}`,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    let successCount = 0;
    let errorCount = 0;
    const importErrors: string[] = [];

    for (const item of data) {
      try {
        await importFunction(item);
        successCount++;
      } catch (error: any) {
        errorCount++;
        const errorMsg = error?.error?.message || 'Error desconocido';
        const itemName = item.name || item.title || item.id || 'Sin nombre';
        importErrors.push(`${itemName}: ${errorMsg}`);
      }
    }

    return { successCount, errorCount, errors: importErrors };
  }

  /**
   * Muestra el resultado final de la importación
   */
  showImportResult(
    result: { successCount: number; errorCount: number; errors: string[] },
    entityName: string = 'elementos'
  ): void {
    const { successCount, errorCount, errors } = result;

    let resultText = `
      <div style="text-align: left;">
        <strong>Importación completada:</strong><br>
        • ${entityName} creados exitosamente: ${successCount}<br>
        • ${entityName} con errores: ${errorCount}
      </div>
    `;

    if (errors.length > 0) {
      resultText += `<br><br><strong>Errores:</strong><br>`;
      resultText += errors.slice(0, 5).join('<br>');
      if (errors.length > 5) {
        resultText += `<br>... y ${errors.length - 5} más`;
      }
    }

    Swal.fire({
      icon: successCount > 0 ? 'success' : 'error',
      title: successCount > 0 ? 'Importación completada' : 'Error en la importación',
      html: resultText,
    });
  }

  /**
   * Crea una plantilla de Excel con datos de ejemplo
   */
  createTemplate(
    columns: ExcelColumn[],
    fileName: string,
    exampleData?: any[]
  ): void {
    const templateData = exampleData || this.generateExampleData(columns);

    // Crear el workbook y worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(templateData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    // Agregar la hoja al workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');

    // Descargar el archivo
    XLSX.writeFile(wb, fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`);

    Swal.fire({
      icon: 'info',
      title: 'Plantilla descargada',
      text: 'Use esta plantilla como referencia para importar sus datos',
      timer: 3000,
      showConfirmButton: false
    });
  }

  /**
   * Genera datos de ejemplo basados en las columnas definidas
   */
  private generateExampleData(columns: ExcelColumn[]): any[] {
    const example1: any = {};
    const example2: any = {};

    columns.forEach(column => {
      const exampleValue = this.getExampleValue(column);
      example1[column.label] = exampleValue.example1;
      example2[column.label] = exampleValue.example2;
    });

    return [example1, example2];
  }

  /**
   * Obtiene valores de ejemplo para cada tipo de columna
   */
  private getExampleValue(column: ExcelColumn): { example1: any; example2: any } {
    switch (column.type) {
      case 'number':
        return { example1: 25.99, example2: 15.50 };
      case 'integer':
        return { example1: 100, example2: 50 };
      default:
        if (column.key.toLowerCase().includes('name') || column.key.toLowerCase().includes('nombre')) {
          return { example1: 'Ejemplo 1', example2: 'Ejemplo 2' };
        }
        if (column.key.toLowerCase().includes('description') || column.key.toLowerCase().includes('descripcion')) {
          return { example1: 'Descripción del ejemplo 1', example2: 'Descripción del ejemplo 2' };
        }
        if (column.key.toLowerCase().includes('category') || column.key.toLowerCase().includes('categoria')) {
          return { example1: 'Categoría A', example2: 'Categoría B' };
        }
        if (column.key.toLowerCase().includes('unit') || column.key.toLowerCase().includes('unidad')) {
          return { example1: 'pcs', example2: 'kg' };
        }
        return { example1: `Ejemplo ${column.label} 1`, example2: `Ejemplo ${column.label} 2` };
    }
  }
}