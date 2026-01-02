import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ChatService } from '../../services/chat.service';

interface OfertaDetalle {
  idOferta: number;
  idEmpresa: number;
  titulo: string;
  descripcion: string;
  precio: number;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  detalles?: string | null;
  estado?: string | null;
  fechaCreacion?: string | null;
  status?: boolean | null;
  capacidad?: number | null;
  dificultad?: string | null;
  duracion?: string | null;
  empresa?: string | null;
  nombreEmpresa?: string | null;
  destino?: string | null;
  nombreDestino?: string | null;
  calificacion?: number | null;
  resenas?: number | null;
}

interface CatalogoItem {
  id: number;
  nombre: string;
}

interface MultimediaOferta {
  idMultimediaOferta?: number;
  objectName?: string | null;
  url?: string | null;
  status?: boolean | null;
}

interface OfertaDetalleResponse {
  oferta: OfertaDetalle;
  destinos: CatalogoItem[];
  actividades: CatalogoItem[];
  multimedia: MultimediaOferta[];
}

interface Resena {
  idResena: number;
  idOferta: number;
  idTurista: number;
  calificacion: number;
  comentario: string;
  fecha: string;
  idUsuario: number;
  nombreUsuario: string;
}

@Component({
  selector: 'app-oferta-detalle',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    FormsModule
  ],
  templateUrl: './oferta-detalle.component.html',
  styleUrl: './oferta-detalle.component.css'
})
export class OfertaDetalleComponent implements OnInit {
  ofertaId: number | null = null;
  oferta: OfertaDetalle | null = null;
  destinos: CatalogoItem[] = [];
  actividades: CatalogoItem[] = [];
  multimedia: MultimediaOferta[] = [];
  mainImageUrl: string | null = null;
  galeriaUrls: string[] = [];
  videoUrl: string | null = null;
  destinoDisplay = '';
  actividadesNombres: string[] = [];
  empresaNombre = '';
  rangoFechas = '';
  loading = false;
  errorMessage = '';

  resenas: Resena[] = [];
  loadingResenas = false;
  resenasError = '';
  calificacionTemp = 0;
  comentarioResena = '';
  submitLoading = false;
  submitError = '';
  submitSuccess = '';
  calificacionPromedio = 0;
  totalResenas = 0;

  private readonly detalleUrl = '/oferta/detalle';
  private readonly resenasUrl = '/resenas/oferta';
  private readonly crearResenaUrl = '/resenas/crear';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;
    if (id == null || Number.isNaN(id)) {
      this.errorMessage = 'No se encontro el identificador de la oferta.';
      return;
    }
    this.ofertaId = id;
    this.cargarDetalle(id);
    this.cargarResenas(id);
  }

  enviarResena() {
    if (this.ofertaId == null) {
      return;
    }
    const comentario = this.comentarioResena.trim();
    if (!this.calificacionTemp || this.calificacionTemp < 1) {
      this.submitError = 'Selecciona una calificacion.';
      return;
    }
    if (!comentario) {
      this.submitError = 'Escribe un comentario.';
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      this.submitError = 'Debes iniciar sesion para enviar una resena.';
      return;
    }

    this.submitError = '';
    this.submitSuccess = '';
    this.submitLoading = true;

    const payload = {
      idOferta: this.ofertaId,
      calificacion: this.calificacionTemp,
      comentario
    };

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.post<Resena>(this.crearResenaUrl, payload, { headers }).subscribe({
      next: (response) => {
        this.submitLoading = false;
        this.submitSuccess = 'Resena enviada correctamente.';
        this.calificacionTemp = 0;
        this.comentarioResena = '';
        this.resenas = [response, ...this.resenas];
        this.actualizarCalificacion();
      },
      error: () => {
        this.submitLoading = false;
        this.submitError = 'No se pudo enviar la resena.';
      }
    });
  }

  abrirChatConEmpresa() {
    if (!this.oferta || this.oferta.idEmpresa == null) {
      return;
    }
    const empresaNombre = this.empresaNombre || 'Empresa';
    this.chatService.abrirChat({
      idEmpresa: this.oferta.idEmpresa,
      empresa: empresaNombre
    });
  }

  get empresaInicial(): string {
    const nombre = this.empresaNombre || 'Empresa';
    return nombre ? nombre.charAt(0).toUpperCase() : 'E';
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
        this.destinoDisplay = this.destinos.map((item) => item.nombre).filter(Boolean).join(', ');
        this.actividadesNombres = this.actividades.map((item) => item.nombre).filter(Boolean);
        this.empresaNombre = this.resolveEmpresaNombre(this.oferta);
        this.rangoFechas = this.construirRangoFechas(
          this.oferta?.fechaInicio ?? null,
          this.oferta?.fechaFin ?? null
        );

        this.multimedia = (response.multimedia ?? []).filter((item) => item?.status !== false);
        const imageUrls = this.multimedia
          .filter((item) => !this.isVideo(item))
          .map((item) => this.getMediaUrl(item))
          .filter((url): url is string => Boolean(url));

        this.mainImageUrl = imageUrls[0] ?? null;
        this.galeriaUrls = imageUrls.slice(1, 5);

        const videoUrls = this.multimedia
          .filter((item) => this.isVideo(item))
          .map((item) => this.getMediaUrl(item))
          .filter((url): url is string => Boolean(url));
        this.videoUrl = videoUrls[0] ?? null;

        this.loading = false;
        this.actualizarCalificacion();
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar el detalle de la oferta.';
        this.loading = false;
      }
    });
  }

  private cargarResenas(idOferta: number) {
    this.loadingResenas = true;
    this.resenasError = '';
    this.http.get<Resena[]>(`${this.resenasUrl}/${idOferta}`).subscribe({
      next: (response) => {
        this.resenas = Array.isArray(response) ? response : [];
        this.loadingResenas = false;
        this.actualizarCalificacion();
      },
      error: () => {
        this.resenas = [];
        this.loadingResenas = false;
        this.resenasError = 'No se pudieron cargar las resenas.';
        this.actualizarCalificacion();
      }
    });
  }

  private actualizarCalificacion() {
    if (this.resenas.length) {
      const total = this.resenas.reduce((sum, item) => sum + (item.calificacion || 0), 0);
      this.totalResenas = this.resenas.length;
      this.calificacionPromedio = Number((total / this.totalResenas).toFixed(2));
      return;
    }
    this.totalResenas = this.oferta?.resenas ?? 0;
    this.calificacionPromedio = this.oferta?.calificacion ?? 0;
  }

  private resolveEmpresaNombre(oferta: OfertaDetalle | null): string {
    if (!oferta) {
      return '';
    }
    const nombre = (oferta.empresa ?? oferta.nombreEmpresa ?? '').trim();
    if (nombre) {
      return nombre;
    }
    if (oferta.idEmpresa != null) {
      return `Empresa #${oferta.idEmpresa}`;
    }
    return '';
  }

  private construirRangoFechas(inicio: string | null, fin: string | null): string {
    if (!inicio && !fin) {
      return 'Sin fechas';
    }
    const inicioLabel = this.formatFecha(inicio);
    const finLabel = this.formatFecha(fin);
    if (inicioLabel && finLabel) {
      return `${inicioLabel} - ${finLabel}`;
    }
    return inicioLabel || finLabel || 'Sin fechas';
  }

  private formatFecha(fecha?: string | null): string {
    if (!fecha) {
      return '';
    }
    const clean = fecha.split('T')[0];
    const parts = clean.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      if (year && month && day) {
        return `${day}/${month}/${year}`;
      }
    }
    return fecha;
  }

  private getMediaUrl(item: MultimediaOferta): string | null {
    const url = (item.url ?? '').trim();
    if (url) {
      return url;
    }
    const objectName = (item.objectName ?? '').trim();
    return objectName || null;
  }

  private isVideo(item: MultimediaOferta): boolean {
    const value = (item.url ?? item.objectName ?? '').toLowerCase();
    const clean = value.split('?')[0];
    const ext = clean.split('.').pop() || '';
    return ['mp4', 'webm', 'ogg', 'mov', 'm4v'].includes(ext);
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
