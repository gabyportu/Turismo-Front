import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleOfertaAdminComponent } from './detalle-oferta-admin.component';

describe('DetalleOfertaAdminComponent', () => {
  let component: DetalleOfertaAdminComponent;
  let fixture: ComponentFixture<DetalleOfertaAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleOfertaAdminComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DetalleOfertaAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
