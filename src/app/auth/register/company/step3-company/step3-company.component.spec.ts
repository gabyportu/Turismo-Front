import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Step3CompanyComponent } from './step3-company.component';

describe('Step3CompanyComponent', () => {
  let component: Step3CompanyComponent;
  let fixture: ComponentFixture<Step3CompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Step3CompanyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Step3CompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
