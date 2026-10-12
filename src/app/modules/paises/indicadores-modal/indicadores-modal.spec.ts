import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndicadoresModal } from './indicadores-modal';

describe('IndicadoresModal', () => {
  let component: IndicadoresModal;
  let fixture: ComponentFixture<IndicadoresModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndicadoresModal],
    }).compileComponents();

    fixture = TestBed.createComponent(IndicadoresModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
