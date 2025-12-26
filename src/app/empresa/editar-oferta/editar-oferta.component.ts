import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

interface CatalogoItem {
  id: number;
  nombre: string;
}

interface OfertaDetalle {
  idOferta: number;
  idEmpresa: number;
  titulo: string;
  descripcion: string;
  precio: number;
  fechaInicio: string;
  fechaFin: string;
  detalles: string;
  estado: string;
  fechaCreacion: string;
  status: boolean;
}

interface MultimediaOferta {
  idMultimediaOferta: number;
  objectName: string;
  url: string;
  status: boolean;
}

interface OfertaDetalleResponse {
  oferta: OfertaDetalle;
  destinos: CatalogoItem[];
  actividades: CatalogoItem[];
  multimedia: MultimediaOferta[];
}

interface OfertaEditadaResponse {
  idOferta: number;
  idEmpresa: number;
  titulo: string;
  descripcion: string;
  precio: number;
  fechaInicio: string;
  fechaFin: string;
  detalles: string;
  estado: string;
  fechaCreacion: string;
  status: boolean;
}

@Component({
  selector: 'app-editar-oferta',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  templateUrl: './editar-oferta.component.html',
  styleUrl: './editar-oferta.component.css'
})
export class EditarOfertaComponent implements OnInit {
  ofertaForm: FormGroup;
  ofertaId: number | null = null;
  empresaId: number | null = null;
  loadingDetalle = false;
  detalleError = '';

  fotoPrincipal: string | null = null;
  fotoPrincipalFile: File | null = null;
  fotosAdicionales: string[] = [];
  fotosAdicionalesFiles: File[] = [];
  videoPreview: string | null = null;
  videoFile: File | null = null;
  existingMainImage: string | null = null;
  existingImages: string[] = [];
  existingVideoUrl: string | null = null;

  videoError = '';
  imagenesError = '';
  private readonly maxImages = 5;
  private readonly maxVideoSizeBytes = 50 * 1024 * 1024;

  destinosCatalogo: CatalogoItem[] = [];
  actividadesCatalogo: CatalogoItem[] = [];
  selectedDestinos: number[] = [];
  selectedActividades: number[] = [];
  loadingDestinos = false;
  loadingActividades = false;
  destinosError = '';
  actividadesError = '';

  createLoading = false;
  createError = '';
  createSuccess = '';
  showConfirm = false;
  submitted = false;

  private readonly detalleUrl = '/oferta/detalle';
  private readonly editarOfertaUrl = '/oferta/editar';
  private readonly actividadesUrl = '/catalogos/actividades';
  private readonly destinosUrl = '/catalogos/destinos';
  private readonly actividadesUrlDirect = 'http://localhost:8112/catalogos/actividades';
  private readonly destinosUrlDirect = 'http://localhost:8112/catalogos/destinos';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    this.ofertaForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      precio: ['', [Validators.required, Validators.min(1)]],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      detalles: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;
    if (id == null || Number.isNaN(id)) {
      this.detalleError = 'No se encontro el identificador de la oferta.';
      return;
    }
    this.ofertaId = id;
    this.cargarDestinos();
    this.cargarActividades();
    this.cargarDetalle(id);
  }

  onFotoPrincipal(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files ? input.files[0] : null;
    if (file) {
      const hasExistingMain = Boolean(this.existingMainImage);
      const totalWithoutMain = this.totalImagenes() - (hasExistingMain ? 1 : 0);
      if (!this.fotoPrincipalFile && !hasExistingMain && totalWithoutMain >= this.maxImages) {
        this.imagenesError = `Maximo ${this.maxImages} imagenes en total.`;
        input.value = '';
        return;
      }
      this.imagenesError = '';
      this.existingMainImage = null;
      this.fotoPrincipalFile = file;
      const reader = new FileReader();
      reader.onload = () => (this.fotoPrincipal = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  onFotosAdicionales(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    for (const file of files) {
      if (this.totalImagenes() >= this.maxImages) {
        this.imagenesError = `Maximo ${this.maxImages} imagenes en total.`;
        break;
      }
      this.imagenesError = '';
      this.fotosAdicionalesFiles.push(file);
      const reader = new FileReader();
      reader.onload = () => {
        this.fotosAdicionales.push(reader.result as string);
        this.fotosAdicionales = [...this.fotosAdicionales];
      };
      reader.readAsDataURL(file);
    }
  }

  removeExistingMainImage() {
    if (!this.existingMainImage) {
      return;
    }
    if (this.existingImages.length) {
      this.existingMainImage = this.existingImages.shift() || null;
      this.fotoPrincipal = this.existingMainImage;
    } else {
      this.existingMainImage = null;
      this.fotoPrincipal = null;
    }
    if (this.totalImagenes() <= this.maxImages) {
      this.imagenesError = '';
    }
  }

  removeExistingImage(index: number) {
    if (index < 0 || index >= this.existingImages.length) {
      return;
    }
    this.existingImages.splice(index, 1);
    this.existingImages = [...this.existingImages];
    if (this.totalImagenes() <= this.maxImages) {
      this.imagenesError = '';
    }
  }

  removeExistingVideo() {
    this.existingVideoUrl = null;
    if (!this.videoFile) {
      this.videoPreview = null;
    }
  }

  onVideoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files ? input.files[0] : null;
    this.videoError = '';
    if (!file) {
      return;
    }
    if (!file.type.startsWith('video/')) {
      this.videoError = 'Solo se permiten archivos de video.';
      input.value = '';
      this.videoFile = null;
      this.videoPreview = null;
      return;
    }
    if (file.size > this.maxVideoSizeBytes) {
      const maxMb = Math.floor(this.maxVideoSizeBytes / (1024 * 1024));
      this.videoError = `El video debe pesar menos de ${maxMb} MB.`;
      input.value = '';
      this.videoFile = null;
      this.videoPreview = null;
      return;
    }
    this.existingVideoUrl = null;
    this.videoFile = file;
    const reader = new FileReader();
    reader.onload = () => (this.videoPreview = reader.result as string);
    reader.readAsDataURL(file);
  }

  eliminarFotoAdicional(index: number) {
    this.fotosAdicionales.splice(index, 1);
    this.fotosAdicionalesFiles.splice(index, 1);
    this.fotosAdicionales = [...this.fotosAdicionales];
    this.fotosAdicionalesFiles = [...this.fotosAdicionalesFiles];
    if (this.totalImagenes() <= this.maxImages) {
      this.imagenesError = '';
    }
  }

  toggleSeleccion(id: number, list: number[], event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const index = list.indexOf(id);
    if (checked && index === -1) {
      list.push(id);
      return;
    }
    if (!checked && index !== -1) {
      list.splice(index, 1);
    }
  }

  solicitarActualizacion() {
    this.createError = '';
    this.createSuccess = '';
    this.submitted = true;
    this.imagenesError = '';
    if (this.ofertaForm.invalid) {
      this.ofertaForm.markAllAsTouched();
      this.createError = 'Completa los campos obligatorios.';
      return;
    }
    if (!this.validarSelecciones() || !this.validarImagenes()) {
      return;
    }
    this.showConfirm = true;
  }

  confirmarActualizacion() {
    this.showConfirm = false;
    this.actualizarOferta();
  }

  cancelarActualizacion() {
    this.showConfirm = false;
  }

  private actualizarOferta() {
    if (this.ofertaForm.invalid || this.ofertaId == null) {
      return;
    }

    const idEmpresa = this.empresaId ?? this.getEmpresaId();
    if (idEmpresa == null) {
      this.createError = 'No se encontro el id de la empresa.';
      return;
    }

    const formValue = this.ofertaForm.value;
    const precio = Number(formValue.precio);
    if (!Number.isFinite(precio)) {
      this.createError = 'Ingresa un precio valido.';
      return;
    }

    const payload = {
      oferta: {
        idOferta: this.ofertaId,
        idEmpresa,
        titulo: formValue.titulo,
        descripcion: formValue.descripcion,
        precio,
        fechaInicio: formValue.fechaInicio,
        fechaFin: formValue.fechaFin,
        detalles: formValue.detalles
      },
      destinos: this.selectedDestinos,
      actividades: this.selectedActividades
    };

    const formData = new FormData();
    formData.append('data', JSON.stringify(payload));
    const multimediaFiles = this.getMultimediaFiles();
    multimediaFiles.forEach((file) => {
      formData.append('multimedia', file);
    });

    const token = localStorage.getItem('token');
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    this.createLoading = true;
    this.http.put<OfertaEditadaResponse>(this.editarOfertaUrl, formData, { headers }).subscribe({
      next: () => {
        this.createLoading = false;
        this.createSuccess = 'Oferta actualizada correctamente.';
        this.submitted = false;
        if (this.ofertaId != null) {
          this.router.navigate(['/empresa/oferta', this.ofertaId], {
            queryParams: { updated: Date.now() }
          });
        }
      },
      error: () => {
        this.createLoading = false;
        this.createError = 'No se pudo actualizar la oferta.';
      }
    });
  }

  cancelar() {
    if (this.ofertaId != null) {
      this.router.navigate(['/empresa/oferta', this.ofertaId]);
      return;
    }
    const idEmpresa = this.getEmpresaId() ?? 1;
    this.router.navigate(['/empresa/perfil', idEmpresa]);
  }

  private cargarDetalle(idOferta: number) {
    this.loadingDetalle = true;
    this.detalleError = '';
    const token = localStorage.getItem('token');
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    this.http.get<OfertaDetalleResponse>(`${this.detalleUrl}/${idOferta}`, { headers }).subscribe({
      next: (response) => {
        const oferta = response.oferta;
        this.empresaId = oferta?.idEmpresa ?? this.getEmpresaId();
        this.ofertaForm.patchValue({
          titulo: oferta?.titulo ?? '',
          descripcion: oferta?.descripcion ?? '',
          precio: oferta?.precio ?? '',
          fechaInicio: oferta?.fechaInicio ?? '',
          fechaFin: oferta?.fechaFin ?? '',
          detalles: oferta?.detalles ?? ''
        });
        this.selectedDestinos = (response.destinos ?? []).map((item) => item.id);
        this.selectedActividades = (response.actividades ?? []).map((item) => item.id);

        const media = (response.multimedia ?? []).filter((item) => item?.status !== false);
        const images = media.filter((item) => !this.isVideo(item)).map((item) => item.url);
        const videos = media.filter((item) => this.isVideo(item)).map((item) => item.url);
        this.existingMainImage = images[0] ?? null;
        this.existingImages = images.slice(1);
        this.existingVideoUrl = videos[0] ?? null;
        if (this.existingMainImage) {
          this.fotoPrincipal = this.existingMainImage;
        }
        if (this.existingVideoUrl && !this.videoFile) {
          this.videoPreview = this.existingVideoUrl;
        }
        this.loadingDetalle = false;
      },
      error: () => {
        this.detalleError = 'No se pudo cargar la oferta.';
        this.loadingDetalle = false;
      }
    });
  }

  private cargarDestinos(url = this.destinosUrl, allowFallback = true) {
    this.loadingDestinos = true;
    this.destinosError = '';
    this.http.get<CatalogoItem[]>(url).subscribe({
      next: (response) => {
        this.destinosCatalogo = Array.isArray(response) ? response : [];
        this.loadingDestinos = false;
      },
      error: () => {
        if (allowFallback && url !== this.destinosUrlDirect) {
          this.cargarDestinos(this.destinosUrlDirect, false);
          return;
        }
        this.destinosCatalogo = [];
        this.loadingDestinos = false;
        this.destinosError = 'No se pudieron cargar los destinos.';
      }
    });
  }

  private cargarActividades(url = this.actividadesUrl, allowFallback = true) {
    this.loadingActividades = true;
    this.actividadesError = '';
    this.http.get<CatalogoItem[]>(url).subscribe({
      next: (response) => {
        this.actividadesCatalogo = Array.isArray(response) ? response : [];
        this.loadingActividades = false;
      },
      error: () => {
        if (allowFallback && url !== this.actividadesUrlDirect) {
          this.cargarActividades(this.actividadesUrlDirect, false);
          return;
        }
        this.actividadesCatalogo = [];
        this.loadingActividades = false;
        this.actividadesError = 'No se pudieron cargar las actividades.';
      }
    });
  }

  private getMultimediaFiles(): File[] {
    const files: File[] = [];
    if (this.fotoPrincipalFile) {
      files.push(this.fotoPrincipalFile);
    }
    if (this.videoFile) {
      files.push(this.videoFile);
    }
    return files.concat(this.fotosAdicionalesFiles);
  }

  private getEmpresaId(): number | null {
    const stored = localStorage.getItem('idempresa') ?? localStorage.getItem('empresaId');
    const id = stored ? Number(stored) : null;
    return Number.isFinite(id) ? id : null;
  }

  private totalImagenes(): number {
    const principalCount = this.fotoPrincipalFile ? 1 : this.existingMainImage ? 1 : 0;
    return principalCount + this.existingImages.length + this.fotosAdicionalesFiles.length;
  }

  private validarSelecciones(): boolean {
    let ok = true;
    if (!this.selectedDestinos.length) {
      ok = false;
    }
    if (!this.selectedActividades.length) {
      ok = false;
    }
    return ok;
  }

  private validarImagenes(): boolean {
    const total = this.totalImagenes();
    if (total < 1) {
      this.imagenesError = 'Debes subir al menos una imagen.';
      return false;
    }
    if (total > this.maxImages) {
      this.imagenesError = `Maximo ${this.maxImages} imagenes en total.`;
      return false;
    }
    return true;
  }

  private isVideo(item: MultimediaOferta): boolean {
    const value = (item.url || item.objectName || '').toLowerCase();
    const clean = value.split('?')[0];
    const ext = clean.split('.').pop() || '';
    return ['mp4', 'webm', 'ogg', 'mov', 'm4v'].includes(ext);
  }
}
