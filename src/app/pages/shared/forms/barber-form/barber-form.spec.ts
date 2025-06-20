import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarberForm } from './barber-form';

describe('BarberForm', () => {
  let component: BarberForm;
  let fixture: ComponentFixture<BarberForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarberForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BarberForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
