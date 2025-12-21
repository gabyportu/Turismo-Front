import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterModule } from '@angular/router';

interface OfertaPendiente {
  id: number;
  companyId: number;
  titulo: string;
  descripcion: string
  precio: number;
  duracion: string;
  incluye: string;
  noIncluye: string;
  itinerario: string;
  cupos: number;
  fechaInicio: string;
  fechaFin: string;
  fotoPrincipal: string;
  fotosAdicionales: string[];
  videoPreview: string | null;
  empresaNombre: string;
}

@Component({
  selector: 'app-detalle-oferta-admin',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
  ],
  templateUrl: './detalle-oferta-admin.component.html',
  styleUrl: './detalle-oferta-admin.component.css'
})
export class DetalleOfertaAdminComponent {

  ofertaId!: number;
  oferta!: OfertaPendiente;

  private mockData: OfertaPendiente[] = [
    {
      id: 1,
      companyId: 1,
      titulo: "Salar de Uyuni 3D/2N - Espejo del Cielo",
      descripcion: "La experiencia más surrealista del mundo. Camina sobre el cielo reflejado, duerme en un hotel hecho 100% de sal y vive atardeceres que parecen de otro planeta.",
      precio: 1450,
      duracion: "3 días / 2 noches",
      incluye: "• Transporte 4x4 privado\n• Alojamiento en hotel de sal\n• Todas las comidas\n• Guía certificado",
      noIncluye: "• Entrada al parque (50 Bs)\n• Seguro médico",
      itinerario: "Día 1: Llegada a Uyuni y traslado al hotel de sal\nDía 2: Amanecer en el salar + Isla Incahuasi\nDía 3: Cementerio de trenes y retorno",
      cupos: 12,
      fechaInicio: "2025-02-10",
      fechaFin: "2025-02-12",
      fotoPrincipal: "https://images.unsplash.com/photo-1590524862241-1e90a250a5e8?w=1200",
      fotosAdicionales: [
        "https://images.unsplash.com/photo-1580130662265-337c7e0bc70e?w=800",
        "https://images.unsplash.com/photo-1559523195-5b0a4e8e6a0e?w=800",
        "https://images.unsplash.com/photo-1506905925346-5005b2d80e3d?w=800"
      ],
      videoPreview: null,
      empresaNombre: "Kanoo Tours"
    },
    {
      id: 102,
      companyId: 1,
      titulo: "Death Road en Bicicleta",
      descripcion: "64km de pura adrenalina desde La Cumbre hasta Coroico.",
      precio: 890,
      duracion: "1 día",
      incluye: "• Bicicleta full suspensión\n• Guía\n• Almuerzo",
      noIncluye: "",
      itinerario: "Salida 7am desde La Paz\nLlegada a Coroico 5pm",
      cupos: 15,
      fechaInicio: "2025-01-20",
      fechaFin: "2025-01-20",
      fotoPrincipal: "https://images.unsplash.com/photo-1506905925346-5005b2d80e3d?w=1200",
      fotosAdicionales: [],
      videoPreview: null,
      empresaNombre: "Kanoo Tours"
    }
  ];

  constructor(private route: ActivatedRoute){}

  ngOnInit(): void {
    this.ofertaId = Number(this.route.snapshot.paramMap.get('id'));
    this.oferta = this.mockData.find(o => o.id === this.ofertaId)!;

    if(!this.oferta){
      console.error('Oferta no encontrada con ID:', this.ofertaId);
    }
  }
}
