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
  publicaciones: Publicacion[] = [];
  dataSource: Publicacion[] = [];
  loading = false;
  errorMessage = '';
  confirmOpen = false;
  confirmAction: 'aprobar' | 'rechazar' | null = null;
  confirmOferta: Publicacion | null = null;
  private readonly pendientesUrl = '/oferta/pendientes';
  private readonly aprobarUrl = 'http://localhost:8112/admin/oferta/aprobar';
  private readonly rechazarUrl = 'http://localhost:8112/admin/oferta/rechazar';

  fechaInicio: string | null = null;
  fechaFin: string | null = null;
  busquedaRapida = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
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
          return {
            id: oferta.idOferta,
            companyId: oferta.idEmpresa,
            titulo: oferta.titulo,
            empresa: `Empresa #${oferta.idEmpresa}`,
            fecha: oferta.fechaCreacion || oferta.fechaInicio,
            estado: this.normalizarEstado(oferta.estado),
            descripcion: oferta.descripcion
          };
        });
        this.applyFilters();
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

  applyFilters() {
    let filtered = this.publicaciones;

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
    this.busquedaRapida = '';
    this.applyFilters();
  }

  aprobarOferta(idOferta: number) {
    const oferta = this.publicaciones.find((pub) => pub.id === idOferta);
    if (!oferta) {
      return;
    }
    this.confirmAction = 'aprobar';
    this.confirmOferta = oferta;
    this.confirmOpen = true;
  }

  rechazarOferta(idOferta: number) {
    const oferta = this.publicaciones.find((pub) => pub.id === idOferta);
    if (!oferta) {
      return;
    }
    this.confirmAction = 'rechazar';
    this.confirmOferta = oferta;
    this.confirmOpen = true;
  }

  confirmAceptar() {
    if (!this.confirmOferta || !this.confirmAction) {
      this.confirmOpen = false;
      return;
    }

    const idOferta = this.confirmOferta.id;
    if (this.confirmAction === 'aprobar') {
      this.ejecutarAccionOferta(`${this.aprobarUrl}/${idOferta}`, idOferta);
    } else {
      this.ejecutarAccionOferta(`${this.rechazarUrl}/${idOferta}`, idOferta);
    }

    this.confirmOpen = false;
    this.confirmAction = null;
    this.confirmOferta = null;
  }

  confirmCancelar() {
    this.confirmOpen = false;
    this.confirmAction = null;
    this.confirmOferta = null;
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

  private ejecutarAccionOferta(url: string, idOferta: number) {
    const token = localStorage.getItem('token');
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    this.http.put(url, {}, { headers, responseType: 'text' }).subscribe({
      next: () => {
        this.publicaciones = this.publicaciones.filter((pub) => pub.id !== idOferta);
        this.applyFilters();
      },
      error: () => {
        this.errorMessage = 'No se pudo actualizar el estado de la oferta.';
      }
    });
  }
}
