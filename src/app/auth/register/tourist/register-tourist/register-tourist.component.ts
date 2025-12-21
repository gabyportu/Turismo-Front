import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';


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
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './register-tourist.component.html',
  styleUrl: './register-tourist.component.css'
})
export class RegisterTouristComponent {

  touristForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.touristForm = this.fb.group({
      nombres: ['', Validators.required],
      Apaterno: ['', Validators.required],
      Amaterno: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{7,15}$')]],
      fechaNacimiento: ['', Validators.required],
    }, { validators: this.passwordMatchValidator });
  }
  
  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.touristForm.valid) {
      const touristData = this.touristForm.value;
      localStorage.setItem('turista_' + Date.now(), JSON.stringify(touristData));
      alert('Registro completado con éxito.');
      this.router.navigate(['/login']);
    }
  }
}
