import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
interface RutaAventura{
  id: number;
  titulo: string;
  destino: string;
  dificultad: 'Fácil' | 'Moderado' | 'Difícil' | 'Extremo';
  precio: number;
  duracion: string;
  actividades: string[];
  operador: string;
  calificacion: number;
  resenas: number;
  imagen: string;
  destacado: boolean;
}

@Component({
  selector: 'app-publi-home',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './publi-home.component.html',
  styleUrl: './publi-home.component.css'
})
export class PubliHomeComponent implements OnInit{

  constructor(private router: Router){}
  
  rutas: RutaAventura[] = [
    {
      id: 1,
      titulo: "Salar de Uyuni 3D/2N – Espejo del Cielo",
      destino: "Salar de Uyuni",
      dificultad: "Moderado",
      precio: 1450,
      duracion: "3 días",
      actividades: ["4x4", "Trekking"],
      operador: "Kanoo Tours",
      calificacion: 4.97,
      resenas: 342,
      imagen: "https://images.unsplash.com/photo-1590524862241-1e90a250a5e8?w=800",
      destacado: true
    },
    {
      id: 2,
      titulo: "Death Road en Bicicleta Full Adrenalina",
      destino: "Yungas",
      dificultad: "Extremo",
      precio: 890,
      duracion: "1 día",
      actividades: ["Ciclismo"],
      operador: "Gravity Bolivia",
      calificacion: 4.95,
      resenas: 567,
      imagen: "https://images.unsplash.com/photo-1506905925346-5005b2d80e3d?w=800",
      destacado: true
    },
    {
      id: 3,
      titulo: "Trekking Huayna Potosí 2D",
      destino: "Cordillera Real",
      dificultad: "Difícil",
      precio: 1850,
      duracion: "2 días",
      actividades: ["Trekking", "Montañismo"],
      operador: "Andean Summit",
      calificacion: 4.92,
      resenas: 189,
      imagen: "https://images.unsplash.com/photo-1559523195-5b0a4e8e6a0e?w=800",
      destacado: false
    },
    {
      id: 4,
      titulo: "Pampas del Yacuma – Amazonas Salvaje",
      destino: "Beni",
      dificultad: "Fácil",
      precio: 1350,
      duracion: "3 días",
      actividades: ["Lancha", "Observación de fauna"],
      operador: "Madidi Travel",
      calificacion: 4.99,
      resenas: 412,
      imagen: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800",
      destacado: true
    }
  ];
  ngOnInit(): void {
  }

  irADetalle(id: number){
    this.router.navigate(['/empresa', id])
  }

  getColorDificultad(dificultad: string): string{
    switch (dificultad) {
      case 'Fácil': return 'bg-green-100 text-green-800 border-green-300';
      case 'Moderado': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Difícil': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Extremo': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
