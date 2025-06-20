import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableSortHeader } from './table-sort-header';

describe('TableSortHeader', () => {
  let component: TableSortHeader;
  let fixture: ComponentFixture<TableSortHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableSortHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableSortHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
