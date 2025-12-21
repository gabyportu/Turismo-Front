import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

interface Servicio {
  id: number;
  titulo: string;
  precio: number;
  duracion: string;
  imagen: string;
  calificacion: number;
  resenas: number;
}

interface Empresa {
  nombre: string;
  logo: string;
  descripcion: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  calificacion: number;
  totalResenas: number;
  servicios: Servicio[];
}

@Component({
  selector: 'app-perfil-empresa',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './perfil-empresa.component.html',
  styleUrl: './perfil-empresa.component.css'
})
export class PerfilEmpresaComponent implements OnInit{

  empresa!: Empresa;
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || '1';
    this.empresa = this.getEmpresaPorId(Number(id));
  }

  private getEmpresaPorId(id: number) : Empresa{
    const empresas: {[key: number] : Empresa} = {
      1: {
        nombre: "Kanoo Tours",
        logo: "https://images.unsplash.com/photo-1560472355-5364e9e7c2b8?w=400",
        descripcion: "Los pioneros del Salar de Uyuni desde 2010. Especialistas en tours 4x4, hoteles de sal y fotografía nocturna. Más de 15.000 aventureros felices.",
        whatsapp: "+591 71234567",
        facebook: "kanootours",
        instagram: "kanootours_bolivia",
        calificacion: 4.97,
        totalResenas: 342,
        servicios: [
          { id: 1, titulo: "Salar de Uyuni 3D/2N – Espejo del Cielo", precio: 1450, duracion: "3 días", imagen: "https://images.unsplash.com/photo-1590524862241-1e90a250a5e8?w=800", calificacion: 4.97, resenas: 342 },
          { id: 7, titulo: "Salar + Laguna Colorada 4D/3N", precio: 2150, duracion: "4 días", imagen: "https://images.unsplash.com/photo-1583417319070-4e4d9e5d7f1f?w=800", calificacion: 4.95, resenas: 189 },
          { id: 8, titulo: "Tour Astronómico Salar de Uyuni", precio: 980, duracion: "1 noche", imagen: "https://images.unsplash.com/photo-1506905925346-5005b2d80e3d?w=800", calificacion: 5.0, resenas: 98 }
        ]
      },
      2: {
        nombre: "Gravity Bolivia",
        logo: "https://images.unsplash.com/photo-1581093458791-9ea2b0675f37?w=400",
        descripcion: "Los reyes de la Death Road desde 1998. Bicicletas full suspensión, guías certificados y la bajada más adrenalínica del mundo.",
        whatsapp: "+591 76543210",
        facebook: "gravitybolivia",
        instagram: "gravitybolivia",
        calificacion: 4.95,
        totalResenas: 567,
        servicios: [
          { id: 2, titulo: "Death Road Full Day", precio: 890, duracion: "1 día", imagen: "https://images.unsplash.com/photo-1506905925346-5005b2d80e3d?w=800", calificacion: 4.95, resenas: 567 },
          { id: 9, titulo: "Death Road + Zipline Combo", precio: 1290, duracion: "1 día", imagen: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800", calificacion: 4.93, resenas: 210 }
        ]
      }
    };
    return empresas[id] || empresas[1];
  }
}
