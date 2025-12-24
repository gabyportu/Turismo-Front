import { Component, Output, EventEmitter } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-step1-company',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    RouterModule
  ],
  templateUrl: './step1-company.component.html',
  styleUrl: './step1-company.component.css'
})
export class Step1CompanyComponent {

  @Output() next = new EventEmitter<any>();

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    nit: ['', [Validators.required]],
    descripcion: ['', [Validators.required]],
    idCiudad: [''],
    facebook: [''],
    instagram: [''],
    logo: this.fb.control<File | null>(null, Validators.required)
  });

  submitted = false;
  logoPreview: string | null = null;
  logoFile: File | null = null;

  cities = [
    { id: 1, name: 'La Paz' },
    { id: 2, name: 'El Alto' },
    { id: 3, name: 'Cochabamba' },
    { id: 4, name: 'Quillacollo' },
    { id: 5, name: 'Santa Cruz de la Sierra' },
    { id: 6, name: 'Montero' },
    { id: 7, name: 'Oruro' },
    { id: 8, name: 'Potosi' },
    { id: 9, name: 'Uyuni' },
    { id: 10, name: 'Sucre' },
    { id: 11, name: 'Tarija' },
    { id: 12, name: 'Trinidad' },
    { id: 13, name: 'Cobija' }
  ];

  constructor(
    private fb: FormBuilder
  ) {}

  onLogoSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.logoFile = file;
      this.form.patchValue({ logo: file });
      this.form.get('logo')?.markAsTouched();
      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onNext(){
    this.submitted = true;
    if (this.form.valid) {
      this.next.emit({
        ...this.form.value,
        logoFile: this.logoFile
      });
    } else {
      this.form.markAllAsTouched();
    }
  }

  submit(){
    this.onNext();
  }
}
