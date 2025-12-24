import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';

interface DocumentoEmpresa {
  nombre: string;
  url: string;
  estado: 'recibido' | 'pendiente';
}

interface EmpresaDetalle {
  idEmpresa: number;
  idCiudad: number;
  nombre: string;
  nit: string;
  descripcion: string;
  facebook?: string | null;
  instagram?: string | null;
  estado?: string | null;
}

interface RepresentanteDetalle {
  idRepresentante?: number | null;
  idUsuario?: number | null;
  idEmpresa?: number | null;
  numeroDocumento: string;
  extension: string;
}

interface EmpresaDetalleResponse {
  empresa: EmpresaDetalle;
  representante: RepresentanteDetalle;
  logoUrl?: string | null;
  documentos?: Array<{
    objectName?: string | null;
    url?: string | null;
    status?: boolean | null;
  }>;
}

@Component({
  selector: 'app-detail-company',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    HttpClientModule
  ],
  templateUrl: './detail-company.component.html',
  styleUrl: './detail-company.component.css'
})
export class DetailCompanyComponent implements OnInit {

  empresaId: number | null = null;
  empresa: EmpresaDetalle | null = null;
  representante: RepresentanteDetalle | null = null;
  documentos: DocumentoEmpresa[] = [];
  logoUrl: string | null = null;
  loading = false;
  errorMessage = '';

  private readonly detalleUrl = '/empresa/detalle';
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

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.empresaId = id ? Number(id) : null;
    if (this.empresaId == null || Number.isNaN(this.empresaId)) {
      this.errorMessage = 'No se encontro el identificador de la empresa.';
      return;
    }
    this.cargarDatosEmpresa(this.empresaId);
  }

  cargarDatosEmpresa(idEmpresa: number) {
    this.loading = true;
    this.errorMessage = '';
    const token = localStorage.getItem('token');
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    this.http.get<EmpresaDetalleResponse>(`${this.detalleUrl}/${idEmpresa}`, { headers }).subscribe({
      next: (response) => {
        this.empresa = response.empresa ?? null;
        this.representante = response.representante ?? null;
        this.logoUrl = response.logoUrl ?? null;
        this.documentos = (response.documentos ?? []).map((doc, index) => ({
          nombre: this.getFileName(doc.objectName || doc.url || `Documento ${index + 1}`),
          url: doc.url || '',
          estado: doc.status ? 'recibido' : 'pendiente'
        }));
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar el detalle de la empresa.';
        this.loading = false;
      }
    });
  }

  getCiudadNombre(idCiudad?: number | null): string {
    if (idCiudad == null) {
      return 'Sin ciudad';
    }
    return this.ciudades.get(idCiudad) ?? 'Sin ciudad';
  }

  private getFileName(path: string): string {
    const value = path.split('?')[0];
    const parts = value.split('/');
    return parts[parts.length - 1] || value;
  }

}
