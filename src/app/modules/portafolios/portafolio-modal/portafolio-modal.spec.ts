import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortafolioModal } from './portafolio-modal';

describe('PortafolioModal', () => {
  let component: PortafolioModal;
  let fixture: ComponentFixture<PortafolioModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortafolioModal],
    }).compileComponents();

    fixture = TestBed.createComponent(PortafolioModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
