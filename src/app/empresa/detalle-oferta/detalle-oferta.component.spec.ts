import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleOfertaComponent } from './detalle-oferta.component';

describe('DetalleOfertaComponent', () => {
  let component: DetalleOfertaComponent;
  let fixture: ComponentFixture<DetalleOfertaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleOfertaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DetalleOfertaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
