import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionForm } from './commission-form';

describe('CommissionForm', () => {
  let component: CommissionForm;
  let fixture: ComponentFixture<CommissionForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommissionForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommissionForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
