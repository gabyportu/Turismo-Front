import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, inject, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';

interface Mensaje {
  texto: string;
  esMio: boolean;
  hora: string;
}

interface Conversacion{
  empresa: string;
  ultimoMensaje: string;
  hora: string;
  mensajes: Mensaje[];
}

@Component({
  selector: 'app-chat-flotante-t',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './chat-flotante-t.component.html',
  styleUrl: './chat-flotante-t.component.css'
})
export class ChatFlotanteTComponent {

  chatAbierto = false;
  listaAbierta = false;
  empresaActual = '';
  nuevoMensaje = '';

conversaciones: Conversacion[] = [
    { 
      empresa: "Kanoo Tours", 
      ultimoMensaje: "¡Sí, tenemos cupo para el 20!", 
      hora: "14:30",
      mensajes: [
        { texto: "Hola, ¿tienen disponibilidad para el Salar el 20 de diciembre?", esMio: true, hora: "14:25" },
        { texto: "¡Claro que sí! Tenemos 3 cupos libres", esMio: false, hora: "14:28" },
        { texto: "¡Perfecto! Reservo entonces", esMio: true, hora: "14:30" }
      ]
    },
    { 
      empresa: "Gravity Bolivia", 
      ultimoMensaje: "Te mandé el itinerario", 
      hora: "Ayer",
      mensajes: [
        { texto: "Hola, ¿hacen Death Road los domingos?", esMio: true, hora: "10:15" },
        { texto: "Sí, todos los días del año", esMio: false, hora: "10:20" }
      ]
    }
  ];

  mensajesActuales: Mensaje[] = [];

  constructor(private chatService: ChatService){}

  ngOnInit(){
    this.chatService.abrirChat$.subscribe(empresa =>{
      this.abrirChatDirecto(empresa);
    });
  }

  abrirLista(){
    this.listaAbierta = true;
  }

  abrirChatDirecto(empresa: string){
    this.empresaActual = empresa;
    const conv = this.conversaciones.find(c => c.empresa === empresa);
    if(conv){
      this.mensajesActuales = conv.mensajes;
    }else{
      this.conversaciones.push({
        empresa, 
        ultimoMensaje: "Nuevo mensaje",
        hora: "Ahora",
        mensajes: []
      });
      this.mensajesActuales = [];
    }
    this.chatAbierto = true;
    this.listaAbierta = false;
  }

  volverALista(){
    this.chatAbierto = false;
    this.listaAbierta = true;
  }

  cerrarTodo() {
    this.chatAbierto = false;
    this.listaAbierta = false;
  }

  enviarMensaje() {
    if (!this.nuevoMensaje.trim()) return;

    const hora = new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });

    this.mensajesActuales.push({
      texto: this.nuevoMensaje,
      esMio: true,
      hora
    });

    // Respuesta automática
    setTimeout(() => {
      this.mensajesActuales.push({
        texto: "¡Hola! Gracias por escribirnos. En un momento te atiende uno de nuestros asesores",
        esMio: false,
        hora: new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })
      });
    }, 1000);

    this.nuevoMensaje = '';
  }
}