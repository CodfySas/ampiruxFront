import { Observable, of, switchMap, timer } from 'rxjs';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  NonNullableFormBuilder
} from '@angular/forms';
import { Injectable } from '@angular/core';

export enum OrderType {
  'Small' = 'Small',
  'Medium' = 'Medium',
  'Large' = 'Large'
}

export interface TableItem {
  id: number;
  name: string;
  country: string;
  orderType: OrderType;
  price: string | null;
  isDiscountApplicable: boolean;
  isPriority: boolean;
}

export type TableItemKeys = Record<(keyof TableItem), undefined>;

export interface TableItemForm {
  id: FormControl<number>;
  name: FormControl<string>;
  country: FormControl<string>;
  orderType: FormControl<OrderType>
  price: FormControl<string | null>;
  isDiscountApplicable: FormControl<boolean>;
  isPriority: FormControl<boolean>;
}

@Injectable({
  providedIn: 'root'
})
export class TableDataProvider {
  private readonly EXAMPLE_DATA: TableItem[];

  constructor(private fb: FormBuilder) {
    const enumValues: OrderType[] = Object.values(OrderType);
    this.EXAMPLE_DATA = Array(250).fill(undefined).map((_: any, index: number): TableItem => ({
      id: index,
      name: 'Carlos',
      country: 'Colombia',
      price: index % 5 ? '432' : null,
      orderType: enumValues[Math.floor(Math.random() * enumValues.length)],
      isDiscountApplicable: !(index % 3),
      isPriority: !(index % 10)
    }));
  }

  public getExampleData(): Observable<TableItem[]> {
    return timer(250).pipe(switchMap(() => of(this.EXAMPLE_DATA)));
  }

  public createFormArray(tableItems: TableItem[]): FormArray {
    const builder: NonNullableFormBuilder = this.fb.nonNullable;
    return new FormArray<FormGroup<TableItemForm>>(tableItems.map((tableItem: TableItem): FormGroup<TableItemForm> =>
      builder.group<TableItemForm>({
        id: builder.control(tableItem.id),
        name: builder.control(tableItem.name),
        country: builder.control(tableItem.country),
        orderType: builder.control(tableItem.orderType),
        price: builder.control(tableItem.price),
        isDiscountApplicable: builder.control(tableItem.isDiscountApplicable),
        isPriority: builder.control(tableItem.isPriority)
      })
    ));
  }
}
