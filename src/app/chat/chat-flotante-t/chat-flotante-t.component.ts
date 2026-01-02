import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatConversacion, ChatMensaje, ChatService, ChatTarget } from '../../services/chat.service';

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
  empresaActualId: number | null = null;
  turistaActualId: number | null = null;
  nuevoMensaje = '';
  envioError = '';

  conversaciones: ChatConversacion[] = [];
  mensajesActuales: ChatMensaje[] = [];

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.ensureCompanyConnection();
    this.chatService.refreshCache();
    this.chatService.abrirChat$.subscribe((target) => {
      this.abrirChatDirecto(target, false);
    });
    this.chatService.mensajes$.subscribe((mensajes) => {
      this.mensajesActuales = mensajes;
    });
    this.chatService.conversaciones$.subscribe((conversaciones) => {
      this.conversaciones = conversaciones;
    });
  }

  get mostrarChat(): boolean {
    return this.chatService.shouldShowChat();
  }

  abrirLista() {
    this.chatService.refreshCache();
    this.listaAbierta = true;
  }

  abrirChatDirecto(target: ChatTarget, activar = true) {
    this.empresaActualId = target.idEmpresa;
    this.turistaActualId = target.idTurista ?? null;
    const isCompany = this.isCompany();
    const keyId = isCompany ? this.turistaActualId : this.empresaActualId;
    const convByKey = isCompany
      ? this.conversaciones.find(c => c.idTurista === keyId)
      : this.conversaciones.find(c => c.idEmpresa === keyId);
    const titulo = convByKey?.empresa
      ?? target.empresa
      ?? (isCompany && keyId != null ? `Turista #${keyId}` : 'Conversacion');
    this.empresaActual = titulo;
    this.mensajesActuales = convByKey ? convByKey.mensajes : [];
    if (activar) {
      this.chatService.setActiveChat(target);
    }
    this.chatAbierto = true;
    this.listaAbierta = false;
  }

  volverALista() {
    this.chatAbierto = false;
    this.listaAbierta = true;
  }

  cerrarTodo() {
    this.chatAbierto = false;
    this.listaAbierta = false;
  }

  enviarMensaje() {
    this.envioError = '';
    if (!this.nuevoMensaje.trim()) {
      return;
    }
    const ok = this.chatService.enviarMensaje(this.nuevoMensaje);
    if (!ok) {
      this.envioError = 'No se pudo enviar el mensaje.';
      return;
    }
    this.nuevoMensaje = '';
  }

  private isCompany(): boolean {
    return this.chatService.isCompanyRole();
  }

  private ensureCompanyConnection() {
    if (!this.isCompany()) {
      return;
    }
    const stored = localStorage.getItem('idempresa') ?? localStorage.getItem('empresaId');
    const idEmpresa = stored ? Number(stored) : null;
    if (!Number.isFinite(idEmpresa)) {
      return;
    }
    this.chatService.setActiveChat({
      idEmpresa: idEmpresa as number,
      empresa: 'Empresa'
    });
  }
}
