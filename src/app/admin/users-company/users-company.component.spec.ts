import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersCompanyComponent } from './users-company.component';

describe('UsersCompanyComponent', () => {
  let component: UsersCompanyComponent;
  let fixture: ComponentFixture<UsersCompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersCompanyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UsersCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
