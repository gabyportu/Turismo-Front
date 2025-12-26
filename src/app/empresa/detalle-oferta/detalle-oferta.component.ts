import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { combineLatest } from 'rxjs';

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

interface CatalogoItem {
  id: number;
  nombre: string;
}

interface MultimediaOferta {
  idMultimediaOferta: number;
  objectName: string;
  url: string;
  status: boolean;
}

interface MediaItem {
  index: number;
  type: 'image' | 'video';
  url: string;
}

interface OfertaDetalleResponse {
  oferta: OfertaDetalle;
  destinos: CatalogoItem[];
  actividades: CatalogoItem[];
  multimedia: MultimediaOferta[];
}

@Component({
  selector: 'app-oferta-detalle',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule
  ],
  templateUrl: './detalle-oferta.component.html',
  styleUrl: './detalle-oferta.component.css'
})
export class DetalleOfertaComponent implements OnInit {
  ofertaId: number | null = null;
  oferta: OfertaDetalle | null = null;
  destinos: CatalogoItem[] = [];
  actividades: CatalogoItem[] = [];
  multimedia: MultimediaOferta[] = [];
  mediaItems: MediaItem[] = [];
  imageItems: MediaItem[] = [];
  videoItems: MediaItem[] = [];
  mainImage: MediaItem | null = null;
  gridImages: MediaItem[] = [];
  loading = false;
  errorMessage = '';
  lightboxOpen = false;
  lightboxIndex = 0;

  private readonly detalleUrl = '/oferta/detalle';

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    combineLatest([this.route.paramMap, this.route.queryParamMap]).subscribe(([params]) => {
      const idParam = params.get('id');
      const id = idParam ? Number(idParam) : null;
      if (id == null || Number.isNaN(id)) {
        this.errorMessage = 'No se encontro el identificador de la oferta.';
        return;
      }
      this.ofertaId = id;
      this.cargarDetalle(id);
    });
  }

  getEstadoLabel(estado?: string | null): string {
    const value = (estado ?? '').toLowerCase();
    if (value.startsWith('apro')) {
      return 'Aprobado';
    }
    if (value.startsWith('rech')) {
      return 'Rechazado';
    }
    return 'Pendiente';
  }

  getEstadoClase(estado?: string | null): string {
    const value = (estado ?? '').toLowerCase();
    if (value.startsWith('apro')) {
      return 'bg-emerald-100 text-emerald-700';
    }
    if (value.startsWith('rech')) {
      return 'bg-red-100 text-red-700';
    }
    return 'bg-yellow-100 text-yellow-800';
  }

  openLightbox(index: number) {
    if (!this.mediaItems.length) {
      return;
    }
    const safeIndex = Math.min(Math.max(index, 0), this.mediaItems.length - 1);
    this.lightboxIndex = safeIndex;
    this.lightboxOpen = true;
  }

  closeLightbox() {
    this.lightboxOpen = false;
  }

  nextMedia() {
    if (!this.mediaItems.length) {
      return;
    }
    this.lightboxIndex = (this.lightboxIndex + 1) % this.mediaItems.length;
  }

  prevMedia() {
    if (!this.mediaItems.length) {
      return;
    }
    this.lightboxIndex = (this.lightboxIndex - 1 + this.mediaItems.length) % this.mediaItems.length;
  }

  get currentMedia(): MediaItem | null {
    return this.mediaItems[this.lightboxIndex] ?? null;
  }

  formatFecha(fecha?: string | null): string {
    if (!fecha) {
      return 'Sin fecha';
    }
    const clean = fecha.split('T')[0];
    const parts = clean.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      if (year && month && day) {
        return `${month}/${day}/${year}`;
      }
    }
    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) {
      return fecha;
    }
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${mm}/${dd}/${date.getFullYear()}`;
  }

  private cargarDetalle(idOferta: number) {
    this.loading = true;
    this.errorMessage = '';
    const token = localStorage.getItem('token');
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    this.http.get<OfertaDetalleResponse>(`${this.detalleUrl}/${idOferta}`, { headers }).subscribe({
      next: (response) => {
        this.oferta = response.oferta ?? null;
        this.destinos = this.normalizarCatalogo(response.destinos);
        this.actividades = this.normalizarCatalogo(response.actividades);
        this.multimedia = (response.multimedia ?? []).filter((item) => item?.status !== false);
        const rawMedia = this.multimedia
          .map((item) => ({
            type: this.getMediaType(item),
            url: item.url
          }))
          .filter((item) => Boolean(item.url));
        this.mediaItems = rawMedia.map((item, index) => ({
          ...item,
          index
        }));
        this.imageItems = this.mediaItems.filter((item) => item.type === 'image');
        this.videoItems = this.mediaItems.filter((item) => item.type === 'video');
        this.mainImage = this.imageItems[0] ?? null;
        this.gridImages = this.imageItems.slice(1, 5);
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar el detalle de la oferta.';
        this.loading = false;
      }
    });
  }

  private getMediaType(item: MultimediaOferta): MediaItem['type'] {
    const url = (item.url || item.objectName || '').toLowerCase();
    const clean = url.split('?')[0];
    const ext = clean.split('.').pop() || '';
    if (['mp4', 'webm', 'ogg', 'mov', 'm4v'].includes(ext)) {
      return 'video';
    }
    return 'image';
  }

  private normalizarCatalogo(items: CatalogoItem[] | Array<CatalogoItem | number> | null | undefined): CatalogoItem[] {
    if (!Array.isArray(items)) {
      return [];
    }
    return items
      .map((item) => {
        if (typeof item === 'number') {
          return { id: item, nombre: `ID ${item}` };
        }
        const id = Number(item.id);
        const nombre = (item.nombre ?? '').trim();
        if (!Number.isFinite(id)) {
          return null;
        }
        return { id, nombre: nombre || `ID ${id}` };
      })
      .filter((item): item is CatalogoItem => item !== null);
  }
}
