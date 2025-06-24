import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayForm } from './pay-form';

describe('PayForm', () => {
  let component: PayForm;
  let fixture: ComponentFixture<PayForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
