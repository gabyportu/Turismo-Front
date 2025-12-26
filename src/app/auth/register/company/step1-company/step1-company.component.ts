import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface CiudadCatalogo {
  id: number;
  nombre: string;
}

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
    RouterModule,
    HttpClientModule
  ],
  templateUrl: './step1-company.component.html',
  styleUrl: './step1-company.component.css'
})
export class Step1CompanyComponent implements OnInit {

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

  private readonly ciudadesUrl = '/catalogos/ciudades';
  private readonly ciudadesUrlDirect = 'http://localhost:8112/catalogos/ciudades';
  cities: CiudadCatalogo[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.cargarCiudades();
  }

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

  private cargarCiudades() {
    this.fetchCiudades(this.ciudadesUrl);
  }

  private fetchCiudades(url: string) {
    this.http.get<CiudadCatalogo[]>(url).subscribe({
      next: (response) => {
        const ciudades = Array.isArray(response) ? response : [];
        this.cities = ciudades;
      },
      error: () => {
        if (url !== this.ciudadesUrlDirect) {
          this.fetchCiudades(this.ciudadesUrlDirect);
          return;
        }
        this.cities = [];
      }
    });
  }
}
