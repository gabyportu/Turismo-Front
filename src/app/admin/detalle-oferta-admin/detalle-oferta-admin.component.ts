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

interface OfertaDetalleResponse {
  oferta: OfertaDetalle;
  destinos: number[];
  actividades: number[];
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
  destinos: number[] = [];
  actividades: number[] = [];
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
        this.destinos = response.destinos ?? [];
        this.actividades = response.actividades ?? [];
        this.multimedia = response.multimedia ?? [];
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
}
