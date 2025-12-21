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
    CommonModule
  ],
  templateUrl: './register-company.component.html',
  styleUrls: ['./register-company.component.css']
})
export class RegisterCompanyComponent {

  currentStep = 1;

  goToStep(step: number) {
    this.currentStep = step;
  }

  nextStep() {
    if(this.currentStep < 3) this.currentStep++;
  }

  prevStep() {
    if(this.currentStep > 1) this.currentStep--;
  }
}

