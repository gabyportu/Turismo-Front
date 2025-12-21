import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyPubliComponent } from './company-publi.component';

describe('CompanyPubliComponent', () => {
  let component: CompanyPubliComponent;
  let fixture: ComponentFixture<CompanyPubliComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyPubliComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CompanyPubliComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
