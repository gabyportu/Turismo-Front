import { Component, EventEmitter, Output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-step2-company',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterModule
  ],
  templateUrl: './step2-company.component.html',
  styleUrl: './step2-company.component.css'
})
export class Step2CompanyComponent {

  @Output() next = new EventEmitter<any>();
  @Output() back = new EventEmitter<void>();
  
  submitted = false;
  showPassword = false;
  showConfirmPassword = false;

  form = this.fb.group({
    nombres: ['', [Validators.required]],
    apellidoPaterno: ['', [Validators.required]],
    apellidoMaterno: ['', [Validators.required]],
    fechaNacimiento: ['', [Validators.required]],
    genero: ['', [Validators.required]],
    telefono: ['', [Validators.required, Validators.pattern('^[0-9]{7,15}$')]],
    correo: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    numeroDocumento: ['', [Validators.required]],
    extension: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  constructor(private fb: FormBuilder) {}

  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
      return;
    }
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  passwordMatchValidator(group: any) {
    return group.get('password')?.value === group.get('confirmPassword')?.value
      ? null
      : { passwordMismatch: true };
  }

  submit(){
    this.submitted = true;
    if (this.form.valid) {
      this.next.emit(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }

  backStep() {
    this.back.emit();
  }
}
