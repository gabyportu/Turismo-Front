import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';

interface Publicacion {
  id: number;
  companyId: number;
  titulo: string;
  empresa: string;
  fecha: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  ciudadId: number | null;
  ciudad: string;
  descripcion: string;
}

interface OfertaPendiente {
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
  idCiudad?: number | null;
  ciudad?: string | null;
}

interface CiudadCatalogo {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-company-publi',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatDatepickerModule,
    MatNativeDateModule,
    RouterModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './company-publi.component.html',
  styleUrl: './company-publi.component.css'
})
export class CompanyPubliComponent implements OnInit {
  columnas = ['Titulo', 'Empresa', 'Fecha', 'Ciudad', 'Estado', 'Descripcion', 'Acciones'];

  publicaciones: Publicacion[] = [];
  dataSource: Publicacion[] = [];
  loading = false;
  errorMessage = '';
  private readonly pendientesUrl = '/oferta/pendientes';
  private readonly ciudadesUrl = '/catalogos/ciudades';
  private readonly ciudadesUrlDirect = 'http://localhost:8112/catalogos/ciudades';
  private ciudadesMap = new Map<number, string>();

  fechaInicio: string | null = null;
  fechaFin: string | null = null;
  ciudadFiltro = '';
  busquedaRapida = '';

  ciudades: string[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarCiudades();
    this.cargarPendientes();
  }

  cargarPendientes() {
    this.loading = true;
    this.errorMessage = '';
    const token = localStorage.getItem('token');
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    this.http.get<OfertaPendiente[]>(this.pendientesUrl, { headers }).subscribe({
      next: (response) => {
        this.publicaciones = response.map((oferta) => {
          const ciudadId = this.getCiudadId(oferta);
          return {
            id: oferta.idOferta,
            companyId: oferta.idEmpresa,
            titulo: oferta.titulo,
            empresa: `Empresa #${oferta.idEmpresa}`,
            fecha: oferta.fechaCreacion || oferta.fechaInicio,
            ciudadId,
            ciudad: this.getCiudadNombre(ciudadId, oferta.ciudad),
            estado: this.normalizarEstado(oferta.estado),
            descripcion: oferta.descripcion
          };
        });
        this.actualizarCiudadesEnPublicaciones();
        this.loading = false;
      },
      error: () => {
        this.publicaciones = [];
        this.dataSource = [];
        this.errorMessage = 'No se pudieron cargar las publicaciones pendientes.';
        this.loading = false;
      }
    });
  }

  cargarCiudades() {
    const token = localStorage.getItem('token');
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;

    this.fetchCiudades(this.ciudadesUrl, headers, Boolean(token));
  }

  applyFilters() {
    let filtered = this.publicaciones;

    if (this.ciudadFiltro) {
      filtered = filtered.filter((p) => p.ciudad === this.ciudadFiltro);
    }

    if (this.fechaInicio) {
      const inicio = this.parseDateValue(this.fechaInicio);
      if (inicio) {
        filtered = filtered.filter((p) => {
          const fecha = this.parseDateValue(p.fecha);
          return fecha ? fecha >= inicio : false;
        });
      }
    }

    if (this.fechaFin) {
      const fin = this.parseDateValue(this.fechaFin);
      if (fin) {
        filtered = filtered.filter((p) => {
          const fecha = this.parseDateValue(p.fecha);
          return fecha ? fecha <= fin : false;
        });
      }
    }

    if (this.busquedaRapida) {
      const query = this.busquedaRapida.toLowerCase();
      filtered = filtered.filter((p) =>
        p.titulo.toLowerCase().includes(query) ||
        p.empresa.toLowerCase().includes(query) ||
        p.ciudad.toLowerCase().includes(query) ||
        p.estado.toLowerCase().includes(query) ||
        p.fecha.toLowerCase().includes(query) ||
        p.descripcion.toLowerCase().includes(query)
      );
    }
    this.dataSource = filtered;
  }

  applyQuickFilter(event: Event) {
    this.busquedaRapida = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  limpiarFiltros() {
    this.fechaInicio = null;
    this.fechaFin = null;
    this.ciudadFiltro = '';
    this.busquedaRapida = '';
    this.applyFilters();
  }

  private normalizarEstado(estado: string | null | undefined): Publicacion['estado'] {
    const value = (estado ?? '').toLowerCase();
    if (value === 'aprobada' || value === 'rechazada' || value === 'pendiente') {
      return value;
    }
    if (value === 'aprobado') {
      return 'aprobada';
    }
    if (value === 'rechazado') {
      return 'rechazada';
    }
    return 'pendiente';
  }

  private actualizarCiudadesEnPublicaciones() {
    if (!this.publicaciones.length) {
      return;
    }
    this.publicaciones = this.publicaciones.map((pub) => ({
      ...pub,
      ciudad: this.getCiudadNombre(pub.ciudadId, pub.ciudad)
    }));
    this.applyFilters();
  }

  private getCiudadId(oferta: OfertaPendiente): number | null {
    const id = Number(oferta.idCiudad);
    return Number.isFinite(id) ? id : null;
  }

  private getCiudadNombre(ciudadId: number | null, fallback?: string | null): string {
    if (ciudadId != null) {
      const nombre = this.ciudadesMap.get(ciudadId);
      if (nombre) {
        return nombre;
      }
    }
    const value = (fallback ?? '').trim();
    return value || 'Sin ciudad';
  }

  private parseDateValue(value: string | Date | null | undefined): Date | null {
    if (!value) {
      return null;
    }
    if (value instanceof Date) {
      return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }
    if (typeof value === 'string') {
      const clean = value.split('T')[0];
      const parts = clean.split('-');
      if (parts.length === 3) {
        const [year, month, day] = parts;
        if (year && month && day) {
          return new Date(Number(year), Number(month) - 1, Number(day));
        }
      }
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  }

  private fetchCiudades(url: string, headers?: HttpHeaders, retryWithoutAuth = false) {
    this.http.get<CiudadCatalogo[]>(url, { headers }).subscribe({
      next: (response) => {
        const ciudades = Array.isArray(response) ? response : [];
        this.ciudadesMap = new Map(ciudades.map((ciudad) => [ciudad.id, ciudad.nombre]));
        this.ciudades = ciudades.map((ciudad) => ciudad.nombre);
        this.actualizarCiudadesEnPublicaciones();
      },
      error: () => {
        if (retryWithoutAuth) {
          this.fetchCiudades(url, undefined, false);
          return;
        }
        if (url !== this.ciudadesUrlDirect) {
          this.fetchCiudades(this.ciudadesUrlDirect, undefined, false);
          return;
        }
        this.ciudadesMap = new Map();
        this.ciudades = [];
        this.actualizarCiudadesEnPublicaciones();
      }
    });
  }
}
