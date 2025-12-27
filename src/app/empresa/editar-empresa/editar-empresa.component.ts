import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

interface CatalogoCiudad {
  id: number;
  nombre: string;
}

interface EmpresaDetalle {
  idEmpresa: number;
  idCiudad: number;
  nombre: string;
  descripcion: string;
  facebook?: string | null;
  instagram?: string | null;
  logoURL?: string | null;
}

interface RepresentanteDetalle {
  numeroDocumento: string;
  extension: string;
}

interface UsuarioDetalle {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno?: string | null;
  telefono?: string | null;
  genero?: string | null;
}

interface EmpresaDetalleResponse {
  empresa: EmpresaDetalle;
  representante: RepresentanteDetalle;
  usuario?: UsuarioDetalle | null;
  logoUrl?: string | null;
}

interface EditarEmpresaResponse {
  idEmpresa: number;
  idCiudad: number;
  nombre: string;
  descripcion: string;
  facebook?: string | null;
  instagram?: string | null;
  status?: boolean;
}

@Component({
  selector: 'app-editar-empresa',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  templateUrl: './editar-empresa.component.html',
  styleUrl: './editar-empresa.component.css'
})
export class EditarEmpresaComponent implements OnInit {
  empresaForm: FormGroup;
  empresaId: number | null = null;

  logoPreview: string | null = null;
  logoFile: File | null = null;
  existingLogoUrl: string | null = null;
  logoError = '';

  ciudadesCatalogo: CatalogoCiudad[] = [];
  loadingCiudades = false;
  ciudadesError = '';

  loadingDetalle = false;
  detalleError = '';

  createLoading = false;
  createError = '';
  createSuccess = '';
  showConfirm = false;
  submitted = false;

  private readonly detalleUrl = '/empresa/detalle';
  private readonly editarEmpresaUrl = 'http://localhost:8112/empresa/editar';
  private readonly ciudadesUrl = '/catalogos/ciudades';
  private readonly ciudadesUrlDirect = 'http://localhost:8112/catalogos/ciudades';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    this.empresaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      idCiudad: ['', Validators.required],
      facebook: [''],
      instagram: [''],
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidoPaterno: ['', [Validators.required, Validators.minLength(2)]],
      apellidoMaterno: [''],
      telefono: ['', [Validators.required, Validators.minLength(6)]],
      genero: ['', Validators.required],
      numeroDocumento: ['', [Validators.required, Validators.minLength(4)]],
      extension: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : this.getEmpresaId();
    if (id == null || Number.isNaN(id)) {
      this.detalleError = 'No se encontro el identificador de la empresa.';
      return;
    }
    this.empresaId = id;
    this.cargarCiudades();
    this.cargarDetalle(id);
  }

  onLogoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files ? input.files[0] : null;
    this.logoError = '';
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.logoError = 'Solo se permiten imagenes.';
      input.value = '';
      this.logoFile = null;
      this.logoPreview = this.existingLogoUrl;
      return;
    }
    this.existingLogoUrl = null;
    this.logoFile = file;
    const reader = new FileReader();
    reader.onload = () => (this.logoPreview = reader.result as string);
    reader.readAsDataURL(file);
  }

  removeLogo() {
    this.existingLogoUrl = null;
    this.logoFile = null;
    this.logoPreview = null;
  }

  solicitarActualizacion() {
    this.createError = '';
    this.createSuccess = '';
    this.submitted = true;
    if (this.empresaForm.invalid) {
      this.empresaForm.markAllAsTouched();
      this.createError = 'Completa los campos obligatorios.';
      return;
    }
    this.showConfirm = true;
  }

  confirmarActualizacion() {
    this.showConfirm = false;
    this.actualizarEmpresa();
  }

  cancelarActualizacion() {
    this.showConfirm = false;
  }

  cancelar() {
    const idEmpresa = this.empresaId ?? this.getEmpresaId() ?? 1;
    this.router.navigate(['/empresa/perfil', idEmpresa]);
  }

  private actualizarEmpresa() {
    if (this.empresaForm.invalid) {
      return;
    }

    const idEmpresa = this.empresaId ?? this.getEmpresaId();
    if (idEmpresa == null) {
      this.createError = 'No se encontro el id de la empresa.';
      return;
    }

    const formValue = this.empresaForm.value;
    const idCiudad = Number(formValue.idCiudad);
    if (!Number.isFinite(idCiudad)) {
      this.createError = 'Selecciona una ciudad valida.';
      return;
    }

    const facebook = formValue.facebook ? String(formValue.facebook).trim() : null;
    const instagram = formValue.instagram ? String(formValue.instagram).trim() : null;
    const apellidoMaterno = formValue.apellidoMaterno ? String(formValue.apellidoMaterno).trim() : null;

    const payload = {
      empresa: {
        idEmpresa,
        idCiudad,
        nombre: formValue.nombre,
        descripcion: formValue.descripcion,
        facebook,
        instagram
      },
      usuario: {
        nombres: formValue.nombres,
        apellidoPaterno: formValue.apellidoPaterno,
        apellidoMaterno,
        telefono: formValue.telefono,
        genero: formValue.genero
      },
      representante: {
        numeroDocumento: formValue.numeroDocumento,
        extension: formValue.extension
      }
    };

    const formData = new FormData();
    formData.append('data', JSON.stringify(payload));
    if (this.logoFile) {
      formData.append('logo', this.logoFile);
    }

    const token = localStorage.getItem('token');
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    this.createLoading = true;
    this.http.put<EditarEmpresaResponse>(this.editarEmpresaUrl, formData, { headers }).subscribe({
      next: () => {
        this.createLoading = false;
        this.createSuccess = 'Perfil actualizado correctamente.';
        this.submitted = false;
        this.router.navigate(['/empresa/perfil', idEmpresa], {
          queryParams: { updated: Date.now() }
        });
      },
      error: () => {
        this.createLoading = false;
        this.createError = 'No se pudo actualizar la empresa.';
      }
    });
  }

  private cargarDetalle(idEmpresa: number) {
    this.loadingDetalle = true;
    this.detalleError = '';
    const token = localStorage.getItem('token');
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    this.http.get<EmpresaDetalleResponse>(`${this.detalleUrl}/${idEmpresa}`, { headers }).subscribe({
      next: (response) => {
        const empresa = response.empresa ?? null;
        const usuario = response.usuario ?? null;
        const representante = response.representante ?? null;

        this.empresaForm.patchValue({
          nombre: empresa?.nombre ?? '',
          descripcion: empresa?.descripcion ?? '',
          idCiudad: empresa?.idCiudad ?? '',
          facebook: empresa?.facebook ?? '',
          instagram: empresa?.instagram ?? '',
          nombres: usuario?.nombres ?? '',
          apellidoPaterno: usuario?.apellidoPaterno ?? '',
          apellidoMaterno: usuario?.apellidoMaterno ?? '',
          telefono: usuario?.telefono ?? '',
          genero: usuario?.genero ?? '',
          numeroDocumento: representante?.numeroDocumento ?? '',
          extension: representante?.extension ?? ''
        });

        this.existingLogoUrl = response.logoUrl ?? empresa?.logoURL ?? null;
        if (this.existingLogoUrl && !this.logoFile) {
          this.logoPreview = this.existingLogoUrl;
        }
        this.loadingDetalle = false;
      },
      error: () => {
        this.detalleError = 'No se pudo cargar la empresa.';
        this.loadingDetalle = false;
      }
    });
  }

  private cargarCiudades(url = this.ciudadesUrl, allowFallback = true) {
    this.loadingCiudades = true;
    this.ciudadesError = '';
    this.http.get<CatalogoCiudad[]>(url).subscribe({
      next: (response) => {
        this.ciudadesCatalogo = Array.isArray(response) ? response : [];
        this.loadingCiudades = false;
      },
      error: () => {
        if (allowFallback && url !== this.ciudadesUrlDirect) {
          this.cargarCiudades(this.ciudadesUrlDirect, false);
          return;
        }
        this.ciudadesCatalogo = [];
        this.loadingCiudades = false;
        this.ciudadesError = 'No se pudieron cargar las ciudades.';
      }
    });
  }

  private getEmpresaId(): number | null {
    const stored = localStorage.getItem('idempresa') ?? localStorage.getItem('empresaId');
    const id = stored ? Number(stored) : null;
    return Number.isFinite(id) ? id : null;
  }
}
