import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';

interface EmpresaDetalle {
  idEmpresa: number;
  idCiudad?: number | null;
  nombre: string;
  nit?: string | null;
  descripcion?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  whatsapp?: string | null;
  telefono?: string | null;
  logoURL?: string | null;
  estado?: string | null;
}

interface EmpresaDetalleResponse {
  empresa: EmpresaDetalle;
  logoUrl?: string | null;
}

interface ImagenPrincipal {
  idMultimediaOferta?: number;
  objectName?: string | null;
  url?: string | null;
  status?: boolean | null;
}

interface OfertaEmpresa {
  idOferta: number;
  titulo: string;
  descripcion: string;
  precio: number;
  estado?: string | null;
  imagenPrincipal?: ImagenPrincipal | null;
}

@Component({
  selector: 'app-perfil-empresa',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule
  ],
  templateUrl: './perfil-empresa.component.html',
  styleUrl: './perfil-empresa.component.css'
})
export class PerfilEmpresaComponent implements OnInit {
  empresaId: number | null = null;
  empresa: EmpresaDetalle | null = null;
  logoUrl: string | null = null;
  ofertas: OfertaEmpresa[] = [];
  loadingEmpresa = false;
  loadingOfertas = false;
  errorMessage = '';
  ofertasError = '';

  private readonly detalleUrl = '/empresa/detalle';
  private readonly ofertasUrl = '/oferta/empresa/listado';

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

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

  getImagenOferta(oferta: OfertaEmpresa): string | null {
    const imagen = oferta.imagenPrincipal;
    if (imagen?.url) {
      return imagen.url;
    }
    if (imagen?.objectName) {
      return imagen.objectName;
    }
    return null;
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
        this.logoUrl = response.logoUrl ?? response.empresa?.logoURL ?? null;
        this.loadingEmpresa = false;
      },
      error: () => {
        this.empresa = null;
        this.logoUrl = null;
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
        const ofertas = Array.isArray(response) ? response : [];
        this.ofertas = ofertas.filter((oferta) => this.esAprobada(oferta.estado));
        this.loadingOfertas = false;
      },
      error: () => {
        this.ofertas = [];
        this.ofertasError = 'No se pudieron cargar las ofertas de la empresa.';
        this.loadingOfertas = false;
      }
    });
  }

  private esAprobada(estado?: string | null): boolean {
    if (!estado) {
      return true;
    }
    return estado.toLowerCase().startsWith('apro');
  }
}
