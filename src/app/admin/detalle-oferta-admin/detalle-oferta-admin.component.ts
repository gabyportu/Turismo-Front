import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';

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

interface CatalogoItem {
  id: number;
  nombre: string;
}

interface OfertaDetalleResponse {
  oferta: OfertaDetalle;
  destinos: unknown[];
  actividades: unknown[];
  multimedia: MultimediaOferta[];
}

@Component({
  selector: 'app-detalle-oferta-admin',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    HttpClientModule
  ],
  templateUrl: './detalle-oferta-admin.component.html',
  styleUrl: './detalle-oferta-admin.component.css'
})
export class DetalleOfertaAdminComponent implements OnInit {
  ofertaId: number | null = null;
  oferta: OfertaDetalle | null = null;
  destinos: CatalogoItem[] = [];
  actividades: CatalogoItem[] = [];
  multimedia: MultimediaOferta[] = [];
  mainImageUrl: string | null = null;
  galleryUrls: string[] = [];
  estadoLabel = 'Pendiente';
  estadoTone: 'pending' | 'approved' | 'rejected' = 'pending';
  loading = false;
  errorMessage = '';

  private readonly detalleUrl = '/oferta/detalle';

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.ofertaId = id ? Number(id) : null;
    if (this.ofertaId == null || Number.isNaN(this.ofertaId)) {
      this.errorMessage = 'No se encontro el identificador de la oferta.';
      return;
    }

    this.cargarDetalle(this.ofertaId);
  }

  cargarDetalle(idOferta: number) {
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
        this.mainImageUrl = this.multimedia[0]?.url ?? null;
        this.galleryUrls = this.multimedia.slice(1).map((item) => item.url);
        this.setEstado(this.oferta?.estado);
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar el detalle de la oferta.';
        this.loading = false;
      }
    });
  }

  private setEstado(estado?: string | null) {
    const value = (estado ?? '').toLowerCase();
    if (value.startsWith('apro')) {
      this.estadoLabel = 'Aprobado';
      this.estadoTone = 'approved';
      return;
    }
    if (value.startsWith('rech')) {
      this.estadoLabel = 'Rechazado';
      this.estadoTone = 'rejected';
      return;
    }
    this.estadoLabel = 'Pendiente';
    this.estadoTone = 'pending';
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

  private normalizarCatalogo(items: unknown[] | null | undefined): CatalogoItem[] {
    if (!Array.isArray(items)) {
      return [];
    }
    return items
      .map((item, index) => this.mapCatalogoItem(item, index))
      .filter((item): item is CatalogoItem => item !== null);
  }

  private mapCatalogoItem(item: unknown, index: number): CatalogoItem | null {
    if (typeof item === 'number' && Number.isFinite(item)) {
      return { id: item, nombre: `ID ${item}` };
    }
    if (typeof item === 'string') {
      const nombre = item.trim();
      return nombre ? { id: index + 1, nombre } : null;
    }
    if (item == null || typeof item !== 'object') {
      return null;
    }
    const record = item as Record<string, unknown>;
    const nested = record['destino'] ?? record['actividad'] ?? record['item'];
    const source = nested && typeof nested === 'object' ? (nested as Record<string, unknown>) : record;
    const idValue = source['id'] ?? source['idDestino'] ?? source['idActividad'] ?? record['id'];
    const id = Number(idValue);
    const fallbackId = Number.isFinite(id) ? id : index + 1;
    const nombreValue =
      source['nombre'] ??
      source['name'] ??
      source['titulo'] ??
      source['descripcion'] ??
      record['nombre'] ??
      record['name'];
    const nombre = typeof nombreValue === 'string' ? nombreValue.trim() : '';
    return { id: fallbackId, nombre: nombre || `ID ${fallbackId}` };
  }
}
