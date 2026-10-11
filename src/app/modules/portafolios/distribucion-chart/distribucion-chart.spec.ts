import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistribucionChart } from './distribucion-chart';

describe('DistribucionChart', () => {
  let component: DistribucionChart;
  let fixture: ComponentFixture<DistribucionChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DistribucionChart],
    }).compileComponents();

    fixture = TestBed.createComponent(DistribucionChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
