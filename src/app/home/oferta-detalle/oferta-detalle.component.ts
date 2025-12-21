import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-oferta-detalle',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './oferta-detalle.component.html',
  styleUrl: './oferta-detalle.component.css'
})
export class OfertaDetalleComponent {
  oferta: any;
  calificacionTemp = 0;

  resenas = [
    { usuario: "María Choque", fecha: "15 nov 2025", estrellas: 5, comentario: "¡La mejor experiencia de mi vida! El guía fue increíble y el salar es mágico." },
    { usuario: "Carlos Mamani", fecha: "10 nov 2025", estrellas: 5, comentario: "Todo perfecto: puntualidad, comida, alojamiento. 100% recomendado." },
    { usuario: "Ana Pérez", fecha: "5 nov 2025", estrellas: 4, comentario: "Muy buena experiencia, aunque el segundo día hizo mucho frío." }
  ];

  constructor(private route: ActivatedRoute){}

  ngOnInit(): void{
    const id = this.route.snapshot.paramMap.get('id');


    this.oferta = this.getOfertaPorId(Number(id));
  }

      private getOfertaPorId(id: number): any {
      const ofertas: { [key: number]: any } = {
        1: {
          id: 1,
          titulo: "Salar de Uyuni 3D/2N – Espejo del Cielo",
          destino: "Salar de Uyuni",
          precio: 1450,
          duracion: "3 días / 2 noches",
          capacidad: 12,
          dificultad: "Moderado",
          calificacion: 4.97,
          resenas: 342,
          operador: "Kanoo Tours",
          descripcion: "La experiencia más surrealista del mundo. Camina sobre el cielo reflejado, duerme en un hotel hecho 100% de sal y vive atardeceres que parecen de otro planeta.",
          actividades: ["Jeep 4x4", "Trekking suave", "Fotografía nocturna", "Hotel de sal", "Isla Incahuasi", "Cementerio de trenes"],
          imagenPrincipal: "https://images.unsplash.com/photo-1590524862241-1e90a250a5e8?w=1200",
          galeria: [
            "https://images.unsplash.com/photo-1590524862241-1e90a250a5e8?w=800",
            "https://images.unsplash.com/photo-1580130662265-337c7e0bc70e?w=800",
            "https://images.unsplash.com/photo-1559523195-5b0a4e8e6a0e?w=800",
            "https://images.unsplash.com/photo-1506905925346-5005b2d80e3d?w=800",
            "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800"
          ]
        },

        2: {
          id: 2,
          titulo: "Death Road en Bicicleta – La ruta más peligrosa del mundo",
          destino: "Yungas, La Paz",
          precio: 890,
          duracion: "1 día completo",
          capacidad: 15,
          dificultad: "Extremo",
          calificacion: 4.95,
          resenas: 567,
          operador: "Gravity Bolivia",
          descripcion: "64 km de bajada pura adrenalina desde La Cumbre (4.700 m) hasta Coroico. La carretera más peligrosa del mundo ahora es la aventura más épica de Bolivia.",
          actividades: ["Downhill", "Bicicleta full suspensión", "Guía certificado", "Almuerzo buffet", "Piscina al final"],
          imagenPrincipal: "https://images.unsplash.com/photo-1506905925346-5005b2d80e3d?w=1200",
          galeria: [
            "https://images.unsplash.com/photo-1506905925346-5005b2d80e3d?w=800",
            "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800",
            "https://images.unsplash.com/photo-1590524862241-1e90a250a5e8?w=800"
          ]
        },

        3: {
          id: 3,
          titulo: "Parque Nacional Torotoro – Huellas de Dinosaurios + Cuevas",
          destino: "Torotoro, Potosí",
          precio: 780,
          duracion: "2 días / 1 noche",
          capacidad: 10,
          dificultad: "Moderado",
          calificacion: 4.92,
          resenas: 189,
          operador: "Torotoro Expediciones",
          descripcion: "Viaja al pasado: camina entre huellas de dinosaurios reales, explora cavernas impresionantes y nada en cascadas cristalinas.",
          actividades: ["Trekking", "Espeleología", "Cañón del Vergel", "Caverna de Umajalanta", "Ciudad de Itas"],
          imagenPrincipal: "https://images.unsplash.com/photo-1583417319070-4e4d9e5d7f1f?w=1200",
          galeria: [
            "https://images.unsplash.com/photo-1583417319070-4e4d9e5d7f1f?w=800",
            "https://images.unsplash.com/photo-1615748727815-d33e6e8fe8c5?w=800"
          ]
        },

        4: {
          id: 4,
          titulo: "Amazonas Pampas del Yacuma – 3D/2N Selvático",
          destino: "Rurrenabaque, Beni",
          precio: 1350,
          duracion: "3 días / 2 noches",
          capacidad: 8,
          dificultad: "Fácil",
          calificacion: 4.89,
          resenas: 412,
          operador: "Mashaquipe Tours",
          descripcion: "Navega por el río Yacuma, busca anacondas, nada con delfines rosados y observa caimanes al atardecer. La selva boliviana en su máxima expresión.",
          actividades: ["Paseo en bote", "Nado con delfines", "Búsqueda de anacondas", "Piranhas fishing", "Atardecer en la pampa"],
          imagenPrincipal: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200",
          galeria: [
            "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800",
            "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800"
          ]
        },

        5: {
          id: 5,
          titulo: "Lago Titicaca + Isla del Sol – 2D/1N Mágico",
          destino: "Copacabana & Isla del Sol",
          precio: 680,
          duracion: "2 días / 1 noche",
          capacidad: 20,
          dificultad: "Fácil",
          calificacion: 4.88,
          resenas: 298,
          operador: "Titicaca Bolivia",
          descripcion: "El lago navegable más alto del mundo. Recorre la cuna del Imperio Inca, camina por la Isla del Sol y vive una ceremonia ancestral.",
          actividades: ["Barco privado", "Trekking Isla del Sol", "Ceremonia andina", "Alojamiento con vista al lago"],
          imagenPrincipal: "https://images.unsplash.com/photo-1575729914795-8fb17e6e6e3e?w=1200",
          galeria: [
            "https://images.unsplash.com/photo-1575729914795-8fb17e6e6e3e?w=800",
            "https://images.unsplash.com/photo-1567608198508-8b03ffaf6ea3?w=800"
          ]
        },

        6: {
          id: 6,
          titulo: "Tiwanaku + Valle de la Luna – Cultura y Misterio",
          destino: "Tiwanaku & La Paz",
          precio: 380,
          duracion: "1 día completo",
          capacidad: 25,
          dificultad: "Fácil",
          calificacion: 4.85,
          resenas: 523,
          operador: "Andean Secrets",
          descripcion: "Visita la ciudad preincaica más antigua de América y termina con un paseo surrealista por el Valle de la Luna.",
          actividades: ["Visita guiada Tiwanaku", "Museo", "Puerta del Sol", "Valle de la Luna", "Teleférico La Paz"],
          imagenPrincipal: "https://images.unsplash.com/photo-1590524862241-1e90a250a5e8?w=1200", // Cambiar por foto real de Tiwanaku
          galeria: [
            "https://images.unsplash.com/photo-1590524862241-1e90a250a5e8?w=800"
          ]
        }
      };

      return ofertas[id] || ofertas[1]; // Si no existe el ID, muestra el Salar (la estrella)
    }

    getEmpresaId(operador: string): number {
      const mapa = {
        'Kanoo Tours': 1,
        'Gravity Bolivia': 2,
        'Torotoro Expediciones': 3,
        'Mashaquipe Tours': 4,
        'Titicaca Bolivia': 5,
        'Andean Secrets': 6
      };
      return mapa[operador as keyof typeof mapa] || 1;
    };

    abrirChatConEmpresa(empresa: string) {
      // Dispara el evento global
      const event = new CustomEvent('abrir-chat', { detail: empresa });
      document.dispatchEvent(event);
    }
}
