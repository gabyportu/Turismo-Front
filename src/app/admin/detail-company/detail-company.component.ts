import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-detail-company',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './detail-company.component.html',
  styleUrl: './detail-company.component.css'
})
export class DetailCompanyComponent {

  empresaId: string | null = null;
  empresa: any = {};

  responsable: any = {};

  documentos: any[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.empresaId = this.route.snapshot.paramMap.get('id');
    this.cargarDatosEmpresa();
  }

  cargarDatosEmpresa(){
    const registros = Object.keys(localStorage)
    .filter(key => key.startsWith('empresa_'))
    .map(key => JSON.parse(localStorage.getItem(key)!));

    const registro = registros.find(r => r.empresa.nit === this.empresaId);

    if(registro){
      this.empresa = registro.empresa;
      this.responsable = registro.responsable;
      this.documentos = [
        { nombre: 'NIT / RUAT', estado: 'pendiente' },
        { nombre: 'Certificado Legal', estado: 'pendiente' },
        { nombre: 'Logo', estado: 'recibido' }
      ];
    }
  }

}
