import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { NewCompanyComponent } from "../new-company/new-company.component";
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';

interface Empresa {
  id: number;
  nombre: string;
  nit: string;
  ciudad: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
}

@Component({
  selector: 'app-users-company',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NewCompanyComponent,
    HttpClientModule
],
  templateUrl: './users-company.component.html',
  styleUrl: './users-company.component.css'
})
export class UsersCompanyComponent implements OnInit {

  showNewCompanyModal = false;
  busqueda = '';
  errorMessage = '';
  loading = false;
  actionMessage = '';
  actionType: 'success' | 'error' | null = null;
  confirmOpen = false;
  confirmAction: 'aprobar' | 'rechazar' | null = null;
  confirmEmpresa: Empresa | null = null;

  empresas: Empresa[] = [];

  empresasFiltradas: Empresa[] = [...this.empresas];

  private readonly pendientesUrl = '/empresa/pendientes';
  private readonly aprobarUrl = '/admin/empresa/aprobar';
  private readonly rechazarUrl = '/admin/empresa/rechazar';
  private readonly ciudades = new Map<number, string>([
    [1, 'La Paz'],
    [2, 'El Alto'],
    [3, 'Cochabamba'],
    [4, 'Quillacollo'],
    [5, 'Santa Cruz de la Sierra'],
    [6, 'Montero'],
    [7, 'Oruro'],
    [8, 'Potosi'],
    [9, 'Uyuni'],
    [10, 'Sucre'],
    [11, 'Tarija'],
    [12, 'Trinidad'],
    [13, 'Cobija']
  ]);

  constructor(private router: Router, private http: HttpClient){}

  ngOnInit() {
    this.cargarEmpresasPendientes();
  }

  cargarEmpresasPendientes() {
    this.loading = true;
    this.errorMessage = '';
    const token = localStorage.getItem('token');
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    this.http.get<any[]>(this.pendientesUrl, { headers }).subscribe({
      next: (response) => {
        this.empresas = response.map((empresa) => ({
          id: empresa.idEmpresa,
          nombre: empresa.nombre,
          nit: empresa.nit,
          ciudad: this.ciudades.get(empresa.idCiudad) ?? 'Sin ciudad',
          estado: this.normalizarEstado(empresa.estado)
        }));
        this.filtrar();
        this.loading = false;
      },
      error: () => {
        this.empresas = [];
        this.empresasFiltradas = [];
        this.errorMessage = 'No se pudieron cargar las empresas pendientes.';
        this.loading = false;
      }
    });
  }

  filtrar(){
    const query = this.busqueda.toLowerCase().trim();
    if (query === '') {
      this.empresasFiltradas = [...this.empresas];
    } else {
      this.empresasFiltradas = this.empresas.filter(e =>
        e.nombre.toLowerCase().includes(query) ||
        e.nit.includes(query) ||
        e.ciudad.toLowerCase().includes(query)
      );
    }
  }

  verDetalle(id: number) {
    this.router.navigate(['/admin/detail-company', id]);
  }

  aprobar(id: number) {
    const empresa = this.empresas.find(e => e.id === id);
    if (!empresa) {
      return;
    }
    this.confirmAction = 'aprobar';
    this.confirmEmpresa = empresa;
    this.confirmOpen = true;
  }

  rechazar(id: number) {
    const empresa = this.empresas.find(e => e.id === id);
    if (!empresa) {
      return;
    }
    this.confirmAction = 'rechazar';
    this.confirmEmpresa = empresa;
    this.confirmOpen = true;
  }

  openModal(){
    this.showNewCompanyModal = true;
  }

  closeModal() {
    this.showNewCompanyModal = false;
  }

  confirmAceptar() {
    if (!this.confirmEmpresa || !this.confirmAction) {
      this.confirmOpen = false;
      return;
    }

    const id = this.confirmEmpresa.id;
    if (this.confirmAction === 'aprobar') {
      this.ejecutarAccionEmpresa(
        `${this.aprobarUrl}/${id}`,
        'La empresa aprobada exitosamente',
        () => this.quitarEmpresaDeLista(id)
      );
    } else {
      this.ejecutarAccionEmpresa(
        `${this.rechazarUrl}/${id}`,
        'La empresa se rechazo exitosamente',
        () => this.quitarEmpresaDeLista(id)
      );
    }

    this.confirmOpen = false;
    this.confirmAction = null;
    this.confirmEmpresa = null;
  }

  confirmCancelar() {
    this.confirmOpen = false;
    this.confirmAction = null;
    this.confirmEmpresa = null;
  }

  private ejecutarAccionEmpresa(url: string, successMessage: string, onSuccess: () => void) {
    this.actionMessage = '';
    this.actionType = null;
    const token = localStorage.getItem('token');
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    this.http.put(url, {}, { headers, responseType: 'text' }).subscribe({
      next: () => {
        onSuccess();
        this.actionType = 'success';
        this.actionMessage = successMessage;
      },
      error: () => {
        this.actionType = 'error';
        this.actionMessage = 'No se pudo actualizar el estado de la empresa.';
      }
    });
  }

  private quitarEmpresaDeLista(id: number) {
    this.empresas = this.empresas.filter((empresa) => empresa.id !== id);
    this.filtrar();
  }

  private normalizarEstado(estado: string | null | undefined): Empresa['estado'] {
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
