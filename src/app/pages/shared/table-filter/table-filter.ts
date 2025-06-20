
import { ChangeDetectionStrategy, Component, output, OutputEmitterRef } from '@angular/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { KeyValuePipe } from '@angular/common';
import { OrderType } from './table-data-provider';

@Component({
  selector: 'app-table-filter',
   imports: [
    MatFormField,
    MatInput,
    MatLabel,
    MatSelect,
    MatOption,
    ReactiveFormsModule,
    KeyValuePipe
  ],

  templateUrl: './table-filter.html',
  styleUrl: './table-filter.scss'
})
export class TableFilter {
  protected readonly OrderType: typeof OrderType = OrderType;

  protected searchCtr: FormControl = new FormControl();
  protected orderTypeCtr: FormControl = new FormControl();
  protected isDiscountApplicableCtr: FormControl = new FormControl();
  protected isPriorityCtr: FormControl = new FormControl();
  protected formGroup: FormGroup = new FormGroup({
    search: this.searchCtr,
    orderType: this.orderTypeCtr,
    isDiscountApplicable: this.isDiscountApplicableCtr,
    isPriority: this.isPriorityCtr
  });

  valueChanged: OutputEmitterRef<FilterValue> = output();

  constructor() {
    this.searchCtr.valueChanges.pipe(debounceTime(150)).subscribe((): void => this.emitFormValue());
    this.orderTypeCtr.valueChanges.subscribe((): void => this.emitFormValue());
    this.isDiscountApplicableCtr.valueChanges.subscribe((): void => this.emitFormValue());
    this.isPriorityCtr.valueChanges.subscribe((): void => this.emitFormValue());
  }

  private emitFormValue(): void {
    this.formGroup.updateValueAndValidity();
    this.valueChanged.emit(this.formGroup.value);
  }

}

interface FilterValue {
  search: string | null;
  orderType: OrderType;
  isDiscountApplicable: boolean;
  isPriority: boolean;
}
