import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Barbers } from './barbers';

describe('Barbers', () => {
  let component: Barbers;
  let fixture: ComponentFixture<Barbers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Barbers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Barbers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
