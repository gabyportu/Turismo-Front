import { Component, EventEmitter, Output, ViewChild} from '@angular/core';
import { MatStepperModule } from '@angular/material/stepper';
import { Step1CompanyComponent } from '../../auth/register/company/step1-company/step1-company.component';
import { Step2CompanyComponent } from '../../auth/register/company/step2-company/step2-company.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-new-company',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatStepperModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    Step1CompanyComponent,
    Step2CompanyComponent
  ],
  templateUrl: './new-company.component.html',
  styleUrl: './new-company.component.css'
})
export class NewCompanyComponent {

  @Output() close = new EventEmitter<void>();

  currentStep: number = 1;
  datosEmpresa: any = null;
  datosResponsable: any = null;

  onStep1Complete(data:any){
    this.datosEmpresa = data;
    this.currentStep = 2;
  }

  onStep2Complete(data: any){
    this.datosResponsable = data;
    this.saveCompany();
  }

  cancelar(){
    this.close.emit();
  }

  saveCompany() {
    if (!this.datosEmpresa || !this.datosResponsable) {
      alert('Faltan datos por completar');
      return;
    }

    const nuevaEmpresa = {
      empresa: this.datosEmpresa,
      responsable: this.datosResponsable,
      fechaRegistro: new Date().toISOString(),
      estado: 'aprobada',
      origen: 'agregada_desde_admin'
    };

    // Guardamos con un ID único
    const id = 'empresa_admin_' + Date.now();
    localStorage.setItem(id, JSON.stringify(nuevaEmpresa));

    // Mensaje bonito
    alert(`¡Empresa "${this.datosEmpresa.nombre}" agregada exitosamente!`);

    // Cerramos el modal
    this.close.emit;
  }
}