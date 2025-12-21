import { Component } from '@angular/core';
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
    FormsModule
  ],
  templateUrl: './company-publi.component.html',
  styleUrl: './company-publi.component.css'
})
export class CompanyPubliComponent {
  columnas = ['Título', 'Empresa', 'Fecha', 'Ciudad', 'Estado', 'Descripción', 'Acciones'];

  publicaciones = [
    { 
      id: 1,
      companyId: 1,
      titulo: 'Tour por el Salar de Uyuni', 
      empresa: 'Hostal Salar', 
      fecha: '2024-07-15', 
      ciudad: 'Uyuni', 
      estado: 'pendiente' as const, 
      descripcion: 'Explora el majestuoso Salar de Uyuni con nuestro tour guiado.' 
    },
    { 
      id: 2,
      companyId: 2,
      titulo: 'Aventura en la Amazonía', 
      empresa: 'EcoTour Bolivia', 
      fecha: '2024-08-10', 
      ciudad: 'Riberalta', 
      estado: 'aprobada' as const, // ← CORREGIDO
      descripcion: 'Descubre la biodiversidad de la Amazonía boliviana con nosotros.' 
    },
    { 
      id: 3,
      companyId: 3,
      titulo: 'Caminata por los Andes', 
      empresa: 'Aventura Andina', 
      fecha: '2024-09-05', 
      ciudad: 'La Paz', 
      estado: 'rechazada' as const, 
      descripcion: 'Únete a nuestra caminata por las impresionantes montañas andinas.' 
    }
  ];

  dataSource: Publicacion[] = this.publicaciones.filter(p => p.estado === 'pendiente');

  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  ciudadFiltro = '';
  estadoFiltro = '';
  busquedaRapida = '';

  ciudades = ['La Paz', 'Cochabamba', 'Santa Cruz', 'Uyuni', 'Riberalta'];
  estados = [ 'pendiente', 'aprobada', 'rechazada' ];

  applyFilters() {
    let filtered = this.publicaciones;

    if(this.estadoFiltro){
      filtered = filtered.filter(p => p.estado === this.estadoFiltro);
    }

    if(this.ciudadFiltro){
      filtered = filtered.filter(p => p.ciudad === this.ciudadFiltro);
    }

    if(this.fechaInicio){
      const inicio = new Date(this.fechaInicio);
      filtered = filtered.filter(p => new Date(p.fecha) >= inicio);
    }

    if(this.fechaFin){
      const fin = new Date(this.fechaFin);
      filtered = filtered.filter(p => new Date(p.fecha) <= fin);
    }

    if(this.busquedaRapida){
      const query = this.busquedaRapida.toLowerCase();
      filtered = filtered.filter(p =>
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
    this.dataSource = this.publicaciones.filter(p => p.estado === 'pendiente');
  }


}
