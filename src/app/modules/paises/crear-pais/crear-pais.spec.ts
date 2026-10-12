import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearPais } from './crear-pais';

describe('CrearPais', () => {
  let component: CrearPais;
  let fixture: ComponentFixture<CrearPais>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearPais],
    }).compileComponents();

    fixture = TestBed.createComponent(CrearPais);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
