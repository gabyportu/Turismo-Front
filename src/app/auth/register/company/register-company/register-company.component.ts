import { Component } from '@angular/core';
import { Step1CompanyComponent } from '../step1-company/step1-company.component';
import { Step2CompanyComponent } from '../step2-company/step2-company.component';
import { Step3CompanyComponent } from '../step3-company/step3-company.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-register-company',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCardModule,
    Step1CompanyComponent,
    Step2CompanyComponent,
    Step3CompanyComponent,
    CommonModule,
    HttpClientModule,
    RouterModule
  ],
  templateUrl: './register-company.component.html',
  styleUrls: ['./register-company.component.css']
})
export class RegisterCompanyComponent {

  currentStep = 1;
  companyData: any = null;
  userData: any = null;
  representativeData: any = null;
  logoFile: File | null = null;
  documents: File[] = [];
  successMessage = '';
  errorMessage = '';

  constructor(private http: HttpClient) {}

  goToStep(step: number) {
    this.currentStep = step;
  }

  nextStep() {
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onStep1Next(data: any) {
    this.companyData = {
      nombre: data.nombre,
      nit: data.nit,
      descripcion: data.descripcion,
      idCiudad: data.idCiudad ? Number(data.idCiudad) : undefined,
      facebook: data.facebook || null,
      instagram: data.instagram || null
    };
    this.logoFile = data.logoFile || null;
    this.nextStep();
  }

  onStep2Next(data: any) {
    this.userData = {
      nombres: data.nombres,
      apellidoPaterno: data.apellidoPaterno,
      apellidoMaterno: data.apellidoMaterno,
      fechaNacimiento: data.fechaNacimiento,
      genero: data.genero,
      telefono: data.telefono,
      correo: data.correo,
      password: data.password
    };
    this.representativeData = {
      numeroDocumento: data.numeroDocumento,
      extension: data.extension
    };
    this.nextStep();
  }

  onFinish(data: { documents: File[] }) {
    this.documents = data.documents;
    this.submitRegistration();
  }

  private submitRegistration() {
    if (!this.companyData || !this.userData || !this.representativeData) {
      this.successMessage = '';
      this.errorMessage = 'Faltan datos por completar. Revisa los pasos anteriores.';
      return;
    }

    if (!this.logoFile) {
      this.successMessage = '';
      this.errorMessage = 'El logo es obligatorio. Subelo en el primer paso.';
      return;
    }

    if (this.documents.length < 2) {
      this.successMessage = '';
      this.errorMessage = 'Debes subir al menos dos documentos para continuar.';
      return;
    }

    const payload = {
      usuario: this.userData,
      empresa: this.companyData,
      representante: this.representativeData
    };

    const formData = new FormData();
    formData.append('data', JSON.stringify(payload));
    formData.append('logo', this.logoFile);
    this.documents.forEach((file) => {
      formData.append('documentos', file);
    });

    this.http.post('/empresa/registrar', formData).subscribe({
      next: () => {
        this.errorMessage = '';
        this.successMessage = 'Tu empresa fue registrada con exito. Te enviaremos la confirmacion al correo.';
        this.currentStep = 1;
        this.companyData = null;
        this.userData = null;
        this.representativeData = null;
        this.logoFile = null;
        this.documents = [];
      },
      error: () => {
        this.successMessage = '';
        this.errorMessage = 'No se pudo completar el registro. Intenta de nuevo.';
      }
    });
  }
}

