import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

interface EmpresaDetalle {
  idEmpresa: number;
  idCiudad: number;
  nombre: string;
  nit: string;
  descripcion: string;
  facebook?: string | null;
  instagram?: string | null;
  logoURL?: string | null;
  estado?: string | null;
  status?: boolean | null;
}

interface RepresentanteDetalle {
  idRepresentante?: number | null;
  idUsuario?: number | null;
  idEmpresa?: number | null;
  numeroDocumento: string;
  extension: string;
  status?: boolean | null;
}

interface UsuarioDetalle {
  idUsuario: number;
  nombres: string;
  apellidoPaterno?: string | null;
  apellidoMaterno?: string | null;
  fechaNacimiento?: string | null;
  genero?: string | null;
  telefono?: string | null;
}

interface EmpresaDetalleResponse {
  empresa: EmpresaDetalle;
  representante: RepresentanteDetalle;
  usuario?: UsuarioDetalle | null;
  logoUrl?: string | null;
}

interface ImagenPrincipal {
  idMultimediaOferta: number;
  objectName: string;
  url: string;
  status: boolean;
}

interface OfertaEmpresa {
  idOferta: number;
  titulo: string;
  descripcion: string;
  precio: number;
  estado: string;
  imagenPrincipal?: ImagenPrincipal | null;
}

@Component({
  selector: 'app-perfil-empresa',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    HttpClientModule
  ],
  templateUrl: './perfil-empresa.component.html',
  styleUrl: './perfil-empresa.component.css'
})
export class PerfilEmpresaComponent implements OnInit {
  empresaId: number | null = null;
  empresa: EmpresaDetalle | null = null;
  representante: RepresentanteDetalle | null = null;
  usuario: UsuarioDetalle | null = null;
  logoUrl: string | null = null;
  ofertas: OfertaEmpresa[] = [];
  loadingEmpresa = false;
  loadingOfertas = false;
  errorMessage = '';
  ofertasError = '';

  private readonly detalleUrl = '/empresa/detalle';
  private readonly ofertasUrl = '/oferta/empresa/listado-apro-pend';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;
    if (id == null || Number.isNaN(id)) {
      this.errorMessage = 'No se encontro el identificador de la empresa.';
      return;
    }
    this.empresaId = id;
    this.cargarEmpresa(id);
    this.cargarOfertas(id);
  }

  crearNuevaOferta() {
    this.router.navigate(['crear-oferta']);
  }

  editarPerfil() {
    if (this.empresaId != null) {
      this.router.navigate(['/empresa/perfil', this.empresaId], { queryParams: { editar: true } });
    }
  }

  getCiudadNombre(idCiudad?: number | null): string {
    if (idCiudad == null) {
      return 'Sin ciudad';
    }
    const ciudades = new Map<number, string>([
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
    return ciudades.get(idCiudad) ?? 'Sin ciudad';
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

  private cargarEmpresa(idEmpresa: number) {
    this.loadingEmpresa = true;
    this.errorMessage = '';
    const token = localStorage.getItem('token');
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    this.http.get<EmpresaDetalleResponse>(`${this.detalleUrl}/${idEmpresa}`, { headers }).subscribe({
      next: (response) => {
        this.empresa = response.empresa ?? null;
        this.representante = response.representante ?? null;
        this.usuario = response.usuario ?? null;
        this.logoUrl = response.logoUrl ?? null;
        this.loadingEmpresa = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar el perfil de la empresa.';
        this.loadingEmpresa = false;
      }
    });
  }

  private cargarOfertas(idEmpresa: number) {
    this.loadingOfertas = true;
    this.ofertasError = '';
    const token = localStorage.getItem('token');
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    this.http.get<OfertaEmpresa[]>(`${this.ofertasUrl}/${idEmpresa}`, { headers }).subscribe({
      next: (response) => {
        this.ofertas = Array.isArray(response) ? response : [];
        this.loadingOfertas = false;
      },
      error: () => {
        this.ofertas = [];
        this.ofertasError = 'No se pudo cargar las ofertas de la empresa.';
        this.loadingOfertas = false;
      }
    });
  }

}
