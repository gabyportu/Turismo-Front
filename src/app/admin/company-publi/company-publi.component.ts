import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
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

  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  ciudadFiltro = '';
  estadoFiltro = '';
  busquedaRapida = '';

  ciudades: string[] = [];
  estados = ['pendiente', 'aprobada', 'rechazada'];

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
        this.publicaciones = response.map((oferta) => ({
          id: oferta.idOferta,
          companyId: oferta.idEmpresa,
          titulo: oferta.titulo,
          empresa: `Empresa #${oferta.idEmpresa}`,
          fecha: oferta.fechaInicio,
          ciudad: 'Sin ciudad',
          estado: this.normalizarEstado(oferta.estado),
          descripcion: oferta.descripcion
        }));
        this.ciudades = [...new Set(this.publicaciones.map((p) => p.ciudad))];
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

    if (this.estadoFiltro) {
      filtered = filtered.filter((p) => p.estado === this.estadoFiltro);
    }

    if (this.ciudadFiltro) {
      filtered = filtered.filter((p) => p.ciudad === this.ciudadFiltro);
    }

    if (this.fechaInicio) {
      const inicio = new Date(this.fechaInicio);
      filtered = filtered.filter((p) => new Date(p.fecha) >= inicio);
    }

    if (this.fechaFin) {
      const fin = new Date(this.fechaFin);
      filtered = filtered.filter((p) => new Date(p.fecha) <= fin);
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
    this.estadoFiltro = '';
    this.busquedaRapida = '';
    this.dataSource = this.publicaciones.filter((p) => p.estado === 'pendiente');
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
}
