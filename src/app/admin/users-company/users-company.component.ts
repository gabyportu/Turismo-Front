import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
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

interface Empresa {
  id: number;
  nombre: string;
  nit: string;
  ciudad: string;
  telefono: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
}

@Component({
  selector: 'app-users-company',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NewCompanyComponent
],
  templateUrl: './users-company.component.html',
  styleUrl: './users-company.component.css'
})
export class UsersCompanyComponent {

  showNewCompanyModal = false;
  busqueda = '';

  empresas: Empresa[] = [
    { id: 1, nombre: 'EcoTour Bolivia', nit: '102345678', ciudad: 'La Paz', telefono: '77712345', estado: 'pendiente' },
    { id: 2, nombre: 'Hostal Salar', nit: '987654321', ciudad: 'Uyuni', telefono: '44456789', estado: 'aprobada' },
    { id: 3, nombre: 'Aventura Andina', nit: '456789123', ciudad: 'Cochabamba', telefono: '33344556', estado: 'pendiente' },
    { id: 4, nombre: 'Kanoo Tours', nit: '555666777', ciudad: 'Santa Cruz', telefono: '22233344', estado: 'rechazada' }
  ];

  empresasFiltradas: Empresa[] = [...this.empresas];

  constructor(private router: Router){}

  filtrar(){
    const query = this.busqueda.toLowerCase().trim();
    if (query === '') {
      this.empresasFiltradas = [...this.empresas];
    } else {
      this.empresasFiltradas = this.empresas.filter(e =>
        e.nombre.toLowerCase().includes(query) ||
        e.nit.includes(query) ||
        e.ciudad.toLowerCase().includes(query) ||
        e.telefono.includes(query)
      );
    }
  }

  verDetalle(id: number) {
    this.router.navigate(['/admin/detail-company', id]);
  }

  aprobar(id: number) {
    const empresa = this.empresas.find(e => e.id === id);
    if (empresa) {
      empresa.estado = 'aprobada';
      this.filtrar();
      alert(`Empresa "${empresa.nombre}" aprobada`);
    }
  }

  rechazar(id: number) {
    const empresa = this.empresas.find(e => e.id === id);
    if (empresa) {
      empresa.estado = 'rechazada';
      this.filtrar();
      alert(`Empresa "${empresa.nombre}" rechazada`);
    }
  }

  openModal(){
    this.showNewCompanyModal = true;
  }

  closeModal() {
    this.showNewCompanyModal = false;
  }

}