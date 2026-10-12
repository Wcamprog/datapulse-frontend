import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumenGeneral } from './resumen-general';

describe('ResumenGeneral', () => {
  let component: ResumenGeneral;
  let fixture: ComponentFixture<ResumenGeneral>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumenGeneral],
    }).compileComponents();

    fixture = TestBed.createComponent(ResumenGeneral);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
