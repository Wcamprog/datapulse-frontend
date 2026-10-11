import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertaBadge } from './alerta-badge';

describe('AlertaBadge', () => {
  let component: AlertaBadge;
  let fixture: ComponentFixture<AlertaBadge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertaBadge],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertaBadge);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
