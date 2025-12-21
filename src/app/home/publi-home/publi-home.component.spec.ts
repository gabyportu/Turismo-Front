import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PubliHomeComponent } from './publi-home.component';

describe('PubliHomeComponent', () => {
  let component: PubliHomeComponent;
  let fixture: ComponentFixture<PubliHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PubliHomeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PubliHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
