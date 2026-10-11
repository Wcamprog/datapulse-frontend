import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosicionForm } from './posicion-form';

describe('PosicionForm', () => {
  let component: PosicionForm;
  let fixture: ComponentFixture<PosicionForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PosicionForm],
    }).compileComponents();

    fixture = TestBed.createComponent(PosicionForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
