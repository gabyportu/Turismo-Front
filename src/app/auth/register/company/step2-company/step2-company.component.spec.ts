import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Step2CompanyComponent } from './step2-company.component';

describe('Step2CompanyComponent', () => {
  let component: Step2CompanyComponent;
  let fixture: ComponentFixture<Step2CompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Step2CompanyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Step2CompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
