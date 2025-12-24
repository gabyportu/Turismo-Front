import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';


@Component({
  selector: 'app-register-tourist',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    HttpClientModule
  ],
  templateUrl: './register-tourist.component.html',
  styleUrl: './register-tourist.component.css'
})
export class RegisterTouristComponent {

  touristForm: FormGroup;
  readonly minAge = 18;
  maxBirthDate = '';
  showPassword = false;
  showConfirmPassword = false;
  successMessage = '';
  errorMessage = '';
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.maxBirthDate = this.getMaxBirthDate();
    this.touristForm = this.fb.group({
      nombres: ['', Validators.required],
      apellidoPaterno: ['', Validators.required],
      apellidoMaterno: ['', Validators.required],
      fechaNacimiento: ['', [Validators.required, this.minAgeValidator(this.minAge)]],
      genero: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{7,15}$')]],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
      return;
    }

    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    this.submitted = true;
    if (this.touristForm.invalid) {
      this.touristForm.markAllAsTouched();
      return;
    }

    this.successMessage = '';
    this.errorMessage = '';
    const formValue = this.touristForm.value;
    const payload = {
      nombres: formValue.nombres,
      apellidoPaterno: formValue.apellidoPaterno,
      apellidoMaterno: formValue.apellidoMaterno,
      fechaNacimiento: formValue.fechaNacimiento,
      genero: formValue.genero,
      telefono: formValue.telefono,
      correo: formValue.correo,
      password: formValue.password
    };

    this.http.post('http://localhost:8112/turista/registrar', payload).subscribe({
      next: () => {
        this.successMessage = 'Bienvenido a la aventura boliviana. Te llevaremos al login en un momento.';
        this.errorMessage = '';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1400);
      },
      error: () => {
        this.errorMessage = 'No se pudo completar el registro. Intenta de nuevo.';
      }
    });
  }

  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    if (!password || !confirm) {
      return null;
    }
    return password === confirm ? null : { passwordMismatch: true };
  }

  private minAgeValidator(minAge: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }
      const birthDate = new Date(value);
      if (Number.isNaN(birthDate.getTime())) {
        return { invalidDate: true };
      }
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age -= 1;
      }
      return age >= minAge ? null : { minAge: { required: minAge, actual: age } };
    };
  }

  private getMaxBirthDate(): string {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - this.minAge, today.getMonth(), today.getDate());
    const year = maxDate.getFullYear();
    const month = String(maxDate.getMonth() + 1).padStart(2, '0');
    const day = String(maxDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
