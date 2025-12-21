import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Step1CompanyComponent } from './step1-company.component';

describe('Step1CompanyComponent', () => {
  let component: Step1CompanyComponent;
  let fixture: ComponentFixture<Step1CompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Step1CompanyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Step1CompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
