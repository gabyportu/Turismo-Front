import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface CatalogoItem {
  id: number;
  nombre: string;
}

interface OfertaResumen {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number | null;
  calificacion: number | null;
  resenas: number | null;
  imagenUrl: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  fechaRegistro: string | null;
  ciudadId: number | null;
  ciudadNombre: string;
  departamentoId: number | null;
  departamentoNombre: string;
  actividadesIds: number[];
  actividadesNombres: string[];
  operador: string;
  destino: string;
}

interface ActividadApi {
  id?: number;
  idActividad?: number;
  nombre?: string;
  [key: string]: unknown;
}

interface MultimediaApi {
  url?: string;
  objectName?: string;
  [key: string]: unknown;
}

interface OfertaApi {
  idOferta?: number;
  id?: number;
  id_oferta?: number;
  idoferta?: number;
  idCiudad?: number;
  ciudadId?: number;
  id_ciudad?: number;
  idDepartamento?: number;
  departamentoId?: number;
  id_departamento?: number;
  actividades?: Array<number | string | ActividadApi>;
  actividadIds?: Array<number | string | ActividadApi>;
  idActividades?: Array<number | string | ActividadApi>;
  id_actividades?: Array<number | string | ActividadApi>;
  actividadesIds?: Array<number | string | ActividadApi>;
  titulo?: string;
  nombre?: string;
  descripcion?: string;
  detalles?: string;
  precio?: number;
  calificacion?: number;
  puntuacion?: number;
  promedioCalificacion?: number;
  calificacionPromedio?: number;
  resenas?: number;
  totalResenas?: number;
  cantidadResenas?: number;
  imagenPrincipal?: string | { url?: string };
  imagenUrl?: string;
  imagen?: string;
  urlImagen?: string;
  imagenPrincipalUrl?: string;
  imagenPrincipalURL?: string;
  imagen_principal?: string;
  multimedia?: MultimediaApi[];
  fechaInicio?: string;
  fechaFin?: string;
  fechaCreacion?: string;
  fechaRegistro?: string;
  fechaPublicacion?: string;
  fecha_publicacion?: string;
  ciudad?: string | { nombre?: string };
  nombreCiudad?: string;
  ciudadNombre?: string;
  departamento?: string | { nombre?: string };
  nombreDepartamento?: string;
  departamentoNombre?: string;
  operador?: string;
  empresa?: string;
  nombreEmpresa?: string;
  destino?: string;
  nombreDestino?: string;
  ubicacion?: string;
  [key: string]: unknown;
}

@Component({
  selector: 'app-publi-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './publi-home.component.html',
  styleUrl: './publi-home.component.css'
})
export class PubliHomeComponent implements OnInit {
  topOfertas: OfertaResumen[] = [];
  ofertasAprobadas: OfertaResumen[] = [];
  ofertasFiltradas: OfertaResumen[] = [];
  ofertasPaginadas: OfertaResumen[] = [];

  departamentos: CatalogoItem[] = [];
  ciudades: CatalogoItem[] = [];
  actividades: CatalogoItem[] = [];
  selectedDepartamentos: number[] = [];
  selectedCiudades: number[] = [];
  selectedActividades: number[] = [];
  fechaInicio: string | null = null;
  fechaFin: string | null = null;
  busquedaRapida = '';

  currentPage = 1;
  pageSize = 9;
  totalPages = 1;

  loadingTop = false;
  loadingAprobadas = false;
  topError = '';
  aprobadasError = '';

  private departamentosMap = new Map<number, string>();
  private ciudadesMap = new Map<number, string>();
  private actividadesMap = new Map<number, string>();
  private ofertasAprobadasRaw: OfertaApi[] = [];
  private topOfertasRaw: OfertaApi[] = [];
  private searchDebounceId: number | null = null;

  private readonly mejorPuntuadasUrl = '/oferta/mejor-puntuadas';
  private readonly mejorPuntuadasUrlDirect = 'http://localhost:8112/oferta/mejor-puntuadas';
  private readonly aprobadasUrl = '/oferta/aprobadas';
  private readonly aprobadasUrlDirect = 'http://localhost:8112/oferta/aprobadas';
  private readonly departamentosUrl = '/catalogos/departamentos';
  private readonly departamentosUrlDirect = 'http://localhost:8112/catalogos/departamentos';
  private readonly ciudadesUrl = '/catalogos/ciudades';
  private readonly ciudadesUrlDirect = 'http://localhost:8112/catalogos/ciudades';
  private readonly actividadesUrl = '/catalogos/actividades';
  private readonly actividadesUrlDirect = 'http://localhost:8112/catalogos/actividades';

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarCatalogos();
    this.cargarMejorPuntuadas();
    this.cargarAprobadas();
  }

  irADetalle(id: number) {
    this.router.navigate(['/oferta', id]);
  }

  onSearchChange(event: Event) {
    this.busquedaRapida = (event.target as HTMLInputElement).value;
    if (this.searchDebounceId != null) {
      clearTimeout(this.searchDebounceId);
    }
    this.searchDebounceId = window.setTimeout(() => {
      this.currentPage = 1;
      this.applyFilters();
    }, 200);
  }

  onFiltersChange() {
    this.currentPage = 1;
    this.applyFilters();
  }

  limpiarFiltros() {
    this.selectedDepartamentos = [];
    this.selectedCiudades = [];
    this.selectedActividades = [];
    this.fechaInicio = null;
    this.fechaFin = null;
    this.busquedaRapida = '';
    this.currentPage = 1;
    this.applyFilters();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage += 1;
      this.updatePagination();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
      this.updatePagination();
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  trackByOfertaId(index: number, oferta: OfertaResumen) {
    return oferta.id || index;
  }

  toggleSeleccion(id: number, list: number[], event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const index = list.indexOf(id);
    if (checked && index === -1) {
      list.push(id);
    }
    if (!checked && index !== -1) {
      list.splice(index, 1);
    }
    this.onFiltersChange();
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  private cargarCatalogos() {
    this.fetchCatalogo(this.departamentosUrl, this.departamentosUrlDirect, (items) => {
      this.departamentos = items;
      this.departamentosMap = new Map(items.map((item) => [item.id, item.nombre]));
      this.refreshMappedOfertas();
    });
    this.fetchCatalogo(this.ciudadesUrl, this.ciudadesUrlDirect, (items) => {
      this.ciudades = items;
      this.ciudadesMap = new Map(items.map((item) => [item.id, item.nombre]));
      this.refreshMappedOfertas();
    });
    this.fetchCatalogo(this.actividadesUrl, this.actividadesUrlDirect, (items) => {
      this.actividades = items;
      this.actividadesMap = new Map(items.map((item) => [item.id, item.nombre]));
      this.refreshMappedOfertas();
    });
  }

  private cargarMejorPuntuadas(url = this.mejorPuntuadasUrl, allowFallback = true) {
    this.loadingTop = true;
    this.topError = '';
    this.http.get<OfertaApi[] | Record<string, unknown>>(url).subscribe({
      next: (response) => {
        const ofertas = this.extraerOfertas(response);
        this.topOfertasRaw = ofertas;
        this.topOfertas = this.mapOfertas(ofertas).slice(0, 5);
        this.loadingTop = false;
      },
      error: () => {
        if (allowFallback && url !== this.mejorPuntuadasUrlDirect) {
          this.cargarMejorPuntuadas(this.mejorPuntuadasUrlDirect, false);
          return;
        }
        this.topOfertas = [];
        this.topError = 'No se pudieron cargar las ofertas mejor puntuadas.';
        this.loadingTop = false;
      }
    });
  }

  private cargarAprobadas(url = this.aprobadasUrl, allowFallback = true) {
    this.loadingAprobadas = true;
    this.aprobadasError = '';
    const token = localStorage.getItem('token');
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();

    this.http.get<OfertaApi[] | Record<string, unknown>>(url, { headers }).subscribe({
      next: (response) => {
        const ofertas = this.extraerOfertas(response);
        this.ofertasAprobadasRaw = ofertas;
        this.ofertasAprobadas = this.mapOfertas(ofertas);
        this.loadingAprobadas = false;
        this.applyFilters();
      },
      error: () => {
        if (allowFallback && url !== this.aprobadasUrlDirect) {
          this.cargarAprobadas(this.aprobadasUrlDirect, false);
          return;
        }
        this.ofertasAprobadas = [];
        this.ofertasFiltradas = [];
        this.ofertasPaginadas = [];
        this.aprobadasError = 'No se pudieron cargar las ofertas aprobadas.';
        this.loadingAprobadas = false;
      }
    });
  }

  private fetchCatalogo(
    url: string,
    urlDirect: string,
    onSuccess: (items: CatalogoItem[]) => void,
    allowFallback = true
  ) {
    this.http.get<CatalogoItem[] | Record<string, unknown>>(url).subscribe({
      next: (response) => {
        const items = this.extraerCatalogo(response);
        onSuccess(items);
      },
      error: () => {
        if (allowFallback && url !== urlDirect) {
          this.fetchCatalogo(urlDirect, urlDirect, onSuccess, false);
          return;
        }
        onSuccess([]);
      }
    });
  }

  private refreshMappedOfertas() {
    if (this.topOfertasRaw.length) {
      this.topOfertas = this.mapOfertas(this.topOfertasRaw).slice(0, 5);
    }
    if (this.ofertasAprobadasRaw.length) {
      this.ofertasAprobadas = this.mapOfertas(this.ofertasAprobadasRaw);
      this.applyFilters();
    }
  }

  private applyFilters() {
    let filtered = [...this.ofertasAprobadas];

    if (this.selectedDepartamentos.length) {
      filtered = filtered.filter((oferta) =>
        oferta.departamentoId != null && this.selectedDepartamentos.includes(oferta.departamentoId)
      );
    }

    if (this.selectedCiudades.length) {
      filtered = filtered.filter((oferta) =>
        oferta.ciudadId != null && this.selectedCiudades.includes(oferta.ciudadId)
      );
    }

    if (this.selectedActividades.length) {
      filtered = filtered.filter((oferta) =>
        oferta.actividadesIds.some((id) => this.selectedActividades.includes(id))
      );
    }

    if (this.fechaInicio || this.fechaFin) {
      const inicio = this.parseDateValue(this.fechaInicio);
      const fin = this.parseDateValue(this.fechaFin);
      filtered = filtered.filter((oferta) => this.matchDateRange(oferta, inicio, fin));
    }

    if (this.busquedaRapida) {
      const query = this.busquedaRapida.toLowerCase();
      filtered = filtered.filter((oferta) => {
        const actividades = oferta.actividadesNombres.join(' ');
        const hay = [
          oferta.titulo,
          oferta.descripcion,
          oferta.ciudadNombre,
          oferta.departamentoNombre,
          oferta.destino,
          oferta.operador,
          actividades
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return hay.includes(query);
      });
    }

    this.ofertasFiltradas = filtered;
    this.updatePagination();
  }

  private updatePagination() {
    this.totalPages = Math.max(1, Math.ceil(this.ofertasFiltradas.length / this.pageSize));
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.ofertasPaginadas = this.ofertasFiltradas.slice(start, end);
  }

  private mapOfertas(ofertas: OfertaApi[]): OfertaResumen[] {
    return ofertas
      .map((oferta) => this.mapOferta(oferta))
      .filter((oferta): oferta is OfertaResumen => oferta !== null);
  }

  private mapOferta(oferta: OfertaApi): OfertaResumen | null {
    const id = this.toNumber(
      oferta.idOferta ?? oferta.id ?? oferta.id_oferta ?? oferta.idoferta
    );
    if (id == null) {
      return null;
    }

    const ciudadId = this.toNumber(oferta.idCiudad ?? oferta.ciudadId ?? oferta.id_ciudad);
    const departamentoId = this.toNumber(
      oferta.idDepartamento ?? oferta.departamentoId ?? oferta.id_departamento
    );
    const actividades = this.extractActividades(oferta);

    return {
      id,
      titulo: this.toText(oferta.titulo ?? oferta.nombre ?? 'Oferta'),
      descripcion: this.toText(oferta.descripcion ?? oferta.detalles ?? ''),
      precio: this.toNumber(oferta.precio),
      calificacion: this.toNumber(
        oferta.calificacion ?? oferta.puntuacion ?? oferta.promedioCalificacion ?? oferta.calificacionPromedio
      ),
      resenas: this.toNumber(oferta.resenas ?? oferta.totalResenas ?? oferta.cantidadResenas),
      imagenUrl: this.extraerImagen(oferta),
      fechaInicio: this.toTextOrNull(oferta.fechaInicio),
      fechaFin: this.toTextOrNull(oferta.fechaFin),
      fechaRegistro: this.toTextOrNull(
        oferta.fechaCreacion ?? oferta.fechaRegistro ?? oferta.fechaPublicacion ?? oferta.fecha_publicacion
      ),
      ciudadId,
      ciudadNombre: this.getNombreCatalogo(
        ciudadId,
        this.ciudadesMap,
        oferta.ciudad ?? oferta.nombreCiudad ?? oferta.ciudadNombre
      ),
      departamentoId,
      departamentoNombre: this.getNombreCatalogo(
        departamentoId,
        this.departamentosMap,
        oferta.departamento ?? oferta.nombreDepartamento ?? oferta.departamentoNombre
      ),
      actividadesIds: actividades.ids,
      actividadesNombres: actividades.nombres,
      operador: this.toText(oferta.operador ?? oferta.empresa ?? oferta.nombreEmpresa ?? ''),
      destino: this.toText(oferta.destino ?? oferta.nombreDestino ?? oferta.ubicacion ?? '')
    };
  }

  private extractActividades(oferta: OfertaApi): { ids: number[]; nombres: string[] } {
    const raw =
      oferta.actividades ??
      oferta.actividadIds ??
      oferta.idActividades ??
      oferta.id_actividades ??
      oferta.actividadesIds;
    const ids: number[] = [];
    const nombres: string[] = [];

    if (Array.isArray(raw)) {
      raw.forEach((item) => {
        if (typeof item === 'number') {
          ids.push(item);
          return;
        }
        if (typeof item === 'string') {
          nombres.push(item);
          return;
        }
        if (item && typeof item === 'object') {
          const id = this.toNumber(item.id ?? item.idActividad);
          if (id != null) {
            ids.push(id);
          }
          const nombre = this.toText(item.nombre);
          if (nombre) {
            nombres.push(nombre);
          }
        }
      });
    }

    const nombresFromMap = ids
      .map((id) => this.actividadesMap.get(id))
      .filter((item): item is string => Boolean(item));

    const merged = [...new Set([...nombres, ...nombresFromMap])];
    const nombresFinales =
      merged.length > 0 ? merged : ids.map((id) => this.actividadesMap.get(id) || `Actividad ${id}`);

    return { ids, nombres: nombresFinales };
  }

  private extraerImagen(oferta: OfertaApi): string | null {
    if (typeof oferta.imagenPrincipal === 'string') {
      return oferta.imagenPrincipal;
    }
    if (oferta.imagenPrincipal && typeof oferta.imagenPrincipal === 'object') {
      const url = this.toText(oferta.imagenPrincipal.url);
      if (url) {
        return url;
      }
    }
    const candidates = [
      oferta.imagenUrl,
      oferta.imagen,
      oferta.urlImagen,
      oferta.imagenPrincipalUrl,
      oferta.imagenPrincipalURL,
      oferta.imagen_principal
    ];
    for (const candidate of candidates) {
      const value = this.toText(candidate);
      if (value) {
        return value;
      }
    }
    if (Array.isArray(oferta.multimedia) && oferta.multimedia.length) {
      const first = oferta.multimedia.find((item) => Boolean(item?.url)) ?? oferta.multimedia[0];
      return this.toText(first?.url ?? first?.objectName);
    }
    return null;
  }

  private extraerOfertas(response: OfertaApi[] | Record<string, unknown>): OfertaApi[] {
    if (Array.isArray(response)) {
      return response;
    }
    const data =
      (response as { ofertas?: OfertaApi[] }).ofertas ??
      (response as { data?: OfertaApi[] }).data ??
      (response as { results?: OfertaApi[] }).results ??
      (response as { content?: OfertaApi[] }).content;
    return Array.isArray(data) ? data : [];
  }

  private extraerCatalogo(response: CatalogoItem[] | Record<string, unknown>): CatalogoItem[] {
    if (Array.isArray(response)) {
      return response;
    }
    const data =
      (response as { data?: CatalogoItem[] }).data ??
      (response as { results?: CatalogoItem[] }).results ??
      (response as { content?: CatalogoItem[] }).content;
    return Array.isArray(data) ? data : [];
  }

  private getNombreCatalogo(
    id: number | null,
    map: Map<number, string>,
    fallback?: unknown
  ): string {
    if (id != null) {
      const nombre = map.get(id);
      if (nombre) {
        return nombre;
      }
    }
    if (typeof fallback === 'string') {
      return fallback;
    }
    if (fallback && typeof fallback === 'object' && 'nombre' in fallback) {
      return this.toText((fallback as { nombre?: string }).nombre);
    }
    return '';
  }

  private matchDateRange(oferta: OfertaResumen, inicio: Date | null, fin: Date | null): boolean {
    if (!inicio && !fin) {
      return true;
    }
    const registro = this.parseDateValue(oferta.fechaRegistro);
    if (registro) {
      if (inicio && registro < inicio) {
        return false;
      }
      if (fin && registro > fin) {
        return false;
      }
      return true;
    }
    const ofertaInicio = this.parseDateValue(oferta.fechaInicio);
    const ofertaFin = this.parseDateValue(oferta.fechaFin);
    if (!ofertaInicio && !ofertaFin) {
      return false;
    }
    const rangoInicio = ofertaInicio ?? ofertaFin;
    const rangoFin = ofertaFin ?? ofertaInicio;
    if (!rangoInicio || !rangoFin) {
      return false;
    }
    if (inicio && rangoFin < inicio) {
      return false;
    }
    if (fin && rangoInicio > fin) {
      return false;
    }
    return true;
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

  private toNumber(value: unknown): number | null {
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  }

  private toText(value: unknown): string {
    if (value == null) {
      return '';
    }
    return String(value).trim();
  }

  private toTextOrNull(value: unknown): string | null {
    const text = this.toText(value);
    return text ? text : null;
  }
}
