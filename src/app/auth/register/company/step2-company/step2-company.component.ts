import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerInput, MatDatepickerModule, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-step2-company',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDatepickerInput,
    MatDatepickerToggle
  ],
  templateUrl: './step2-company.component.html',
  styleUrl: './step2-company.component.css'
})
export class Step2CompanyComponent {

  @Output() next = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();
  
  form = this.fb.group({
    names: ['', [Validators.required]],
    lastNameFather: ['', [Validators.required]],
    lastNameMother: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    phone: ['', [Validators.required, Validators.pattern('^[0-9]{7,15}$')]],
    birthdate: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  constructor(private fb: FormBuilder) {}

  passwordMatchValidator(g: any) {
    return g.get('password')?.value === g.get('confirmPassword')?.value ? null : { mismatch: true };
  }

  submit(){
    if(this.form.valid){
      this.next.emit();
    }else{
      this.form.markAllAsTouched();
    }
  }

  backStep() {
    this.back.emit();
  }
}