import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject, Subject } from 'rxjs';

export interface ChatTarget {
  idEmpresa: number;
  empresa: string;
  idTurista?: number;
}

export interface ChatMensaje {
  texto: string;
  esMio: boolean;
  hora: string;
  idTurista?: number | null;
  idEmpresa?: number | null;
  idConversacion?: number | null;
  nombreTurista?: string;
  nombreEmpresa?: string;
  rolEmisor?: string;
  idEmisor?: number | null;
  emisorNombre?: string;
}

export interface ChatConversacion {
  idEmpresa: number;
  idTurista: number | null;
  empresa: string;
  ultimoMensaje: string;
  hora: string;
  mensajes: ChatMensaje[];
  updatedAt?: number;
}

interface ChatEntityRef {
  idTurista?: unknown;
  idEmpresa?: unknown;
}

interface ChatPayload {
  idConversacion?: unknown;
  mensaje?: unknown;
  texto?: unknown;
  fechaEnvio?: unknown;
  fecha?: unknown;
  idTurista?: unknown;
  idEmpresa?: unknown;
  nombreTurista?: unknown;
  nombreEmpresa?: unknown;
  rolEmisor?: unknown;
  idEmisor?: unknown;
  esMio?: unknown;
  emisorNombre?: unknown;
  turista?: ChatEntityRef | null;
  empresa?: ChatEntityRef | null;
}

interface ChatHistorialRow {
  idConversacion?: unknown;
  mensaje?: unknown;
  texto?: unknown;
  fechaEnvio?: unknown;
  fecha?: unknown;
  idTurista?: unknown;
  idEmpresa?: unknown;
  nombreTurista?: unknown;
  nombreEmpresa?: unknown;
  rolEmisor?: unknown;
  idEmisor?: unknown;
  esMio?: unknown;
  emisorNombre?: unknown;
  turista?: ChatEntityRef | null;
  empresa?: ChatEntityRef | null;
}

interface ChatResumenRow {
  idTurista?: unknown;
  nombreTurista?: unknown;
  idEmpresa?: unknown;
  nombreEmpresa?: unknown;
  ultimoMensaje?: unknown;
  fechaUltimoMensaje?: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private abrirChatSubject = new Subject<ChatTarget>();
  abrirChat$ = this.abrirChatSubject.asObservable();

  private mensajesSubject = new BehaviorSubject<ChatMensaje[]>([]);
  mensajes$ = this.mensajesSubject.asObservable();
  private conversacionesSubject = new BehaviorSubject<ChatConversacion[]>([]);
  conversaciones$ = this.conversacionesSubject.asObservable();

  private client: Client | null = null;
  private conectado = false;
  private subscriptionId: string | null = null;
  private subscription: { unsubscribe: () => void } | null = null;
  private companySubscriptionId: string | null = null;
  private companySubscription: { unsubscribe: () => void } | null = null;
  private currentTuristaId: number | null = null;
  private currentEmpresaId: number | null = null;
  private currentEmpresaNombre = '';
  private activeConversationKey: string | null = null;
  private conversacionesMap = new Map<string, ChatConversacion>();
  private cacheKey: string | null = null;
  private cacheLoaded = false;
  private readonly maxCachedMessages = 50;
  private readonly debug = true;

  private readonly wsUrl = 'http://localhost:8112/ws-chat';
  private readonly sendDestination = '/app/chat/enviar';
  private readonly historialUrl = 'http://localhost:8112/chat/historial';
  private readonly misChatsUrl = 'http://localhost:8112/chat/mis-chats';

  constructor(private http: HttpClient) {}

  shouldShowChat(): boolean {
    this.ensureCacheLoaded();
    const role = this.resolveUserRole();
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }
    if (role === 'tourist') {
      return this.getTuristaId() != null;
    }
    if (role === 'company') {
      return this.getEmpresaId() != null;
    }
    return false;
  }

  abrirChat(target: ChatTarget) {
    this.setActiveChat(target);
    this.abrirChatSubject.next(target);
  }

  refreshCache() {
    this.cacheLoaded = false;
    this.ensureCacheLoaded();
    this.syncMisChats();
  }

  setActiveChat(target: ChatTarget) {
    this.ensureCacheLoaded();
    this.currentEmpresaId = target.idEmpresa;
    this.currentEmpresaNombre = target.empresa;
    this.currentTuristaId = target.idTurista ?? this.getTuristaId();
    if (this.currentTuristaId != null && this.currentEmpresaId != null) {
      this.activeConversationKey = this.getConversationKey(this.currentTuristaId, this.currentEmpresaId);
      const existing = this.conversacionesMap.get(this.activeConversationKey);
      this.mensajesSubject.next(existing ? [...existing.mensajes] : []);
    } else {
      this.activeConversationKey = null;
      this.mensajesSubject.next([]);
    }
    if (this.currentTuristaId != null && this.currentEmpresaId != null) {
      this.cargarHistorial(this.currentTuristaId, this.currentEmpresaId).subscribe((rows) => {
        this.logDebug('[chat] historial raw', rows);
        const mapped = rows.map((row) => ({
          texto: this.toText(row.mensaje ?? row.texto),
          esMio: this.resolveEsMio(row),
          hora: this.formatHoraFromPayload(this.toText(row.fechaEnvio ?? row.fecha)),
          idTurista: this.toNumber(row.turista?.idTurista ?? row.idTurista),
          idEmpresa: this.toNumber(row.empresa?.idEmpresa ?? row.idEmpresa),
          idConversacion: this.toNumber(row.idConversacion),
          nombreTurista: this.toText(row.nombreTurista) || undefined,
          nombreEmpresa: this.toText(row.nombreEmpresa) || undefined,
          rolEmisor: this.toText(row.rolEmisor) || undefined,
          idEmisor: this.toNumber(row.idEmisor),
          emisorNombre: this.toText(row.emisorNombre) || undefined
        }));
        this.logDebug('[chat] historial mapped', mapped);
        this.storeHistory(mapped, this.currentTuristaId, this.currentEmpresaId);
      });
    }
    this.connectIfNeeded();
  }

  enviarMensaje(texto: string): boolean {
    const mensaje = texto.trim();
    if (!mensaje) {
      return false;
    }
    this.currentEmpresaId = this.currentEmpresaId ?? this.getEmpresaId();
    this.currentTuristaId = this.currentTuristaId ?? this.getTuristaId();
    if (this.currentTuristaId == null || this.currentEmpresaId == null) {
      return false;
    }
    if (!this.client || !this.client.connected) {
      return false;
    }
    const rolEmisor = this.getRolEmisor();
    if (!rolEmisor) {
      return false;
    }
    const idEmisor = rolEmisor === 'TURISTA'
      ? this.currentTuristaId
      : this.currentEmpresaId;
    if (idEmisor == null) {
      return false;
    }
    const payload = {
      idTurista: this.currentTuristaId,
      idEmpresa: this.currentEmpresaId,
      mensaje,
      rolEmisor,
      idEmisor
    };
    this.logDebug('[chat] enviar payload', payload);
    this.client.publish({
      destination: this.sendDestination,
      body: JSON.stringify(payload)
    });
    this.pushMensaje({
      texto: mensaje,
      esMio: true,
      hora: this.formatHora(new Date()),
      idTurista: this.currentTuristaId,
      idEmpresa: this.currentEmpresaId
    }, this.currentTuristaId, this.currentEmpresaId);
    return true;
  }

  getEmpresaActual(): string {
    return this.currentEmpresaNombre;
  }

  getEmpresaActualId(): number | null {
    return this.currentEmpresaId;
  }

  private connectIfNeeded() {
    this.ensureCacheLoaded();
    if (this.client) {
      if (!this.client.active) {
        this.client.activate();
      }
      if (this.conectado) {
        this.subscribeToConversation();
      }
      return;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(this.wsUrl),
      reconnectDelay: 3000,
      onConnect: () => {
        this.conectado = true;
        this.subscribeToConversation();
      },
      onWebSocketClose: () => {
        this.conectado = false;
        this.subscriptionId = null;
        this.subscription = null;
        this.companySubscriptionId = null;
        this.companySubscription = null;
      },
      onStompError: (frame) => {
        console.error('STOMP error', frame.headers['message'], frame.body);
      }
    });

    this.client.activate();
  }

  private subscribeToConversation() {
    if (!this.client || !this.conectado) {
      return;
    }
    const role = this.resolveUserRole();
    if (role === 'company') {
      this.subscribeToEmpresaTopic();
    }
    const empresaId = this.ensureEmpresaId();
    const turistaId = this.currentTuristaId ?? this.ensureTuristaId();
    if (empresaId == null || turistaId == null) {
      return;
    }

    const newSubId = `chat-${turistaId}-${empresaId}`;
    if (this.subscriptionId && this.subscriptionId === newSubId) {
      return;
    }
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    this.subscriptionId = newSubId;
    const destination = `/topic/chat/${turistaId}/${empresaId}`;
    this.subscription = this.client.subscribe(
      destination,
      (message: IMessage) => {
        const payload = this.safeJsonParse(message.body);
        if (payload) {
          this.handleIncomingMessage(payload);
        }
      },
      { id: newSubId }
    );
  }

  private subscribeToEmpresaTopic() {
    if (!this.client || !this.conectado) {
      return;
    }
    const empresaId = this.ensureEmpresaId();
    if (empresaId == null) {
      return;
    }
    const newSubId = `empresa-${empresaId}`;
    if (this.companySubscriptionId && this.companySubscriptionId === newSubId) {
      return;
    }
    if (this.companySubscription) {
      this.companySubscription.unsubscribe();
      this.companySubscription = null;
    }
    this.companySubscriptionId = newSubId;
    const destination = `/topic/empresa/${empresaId}`;
    this.logDebug('[chat] suscrito a', destination);
    this.companySubscription = this.client.subscribe(
      destination,
      (message: IMessage) => {
        const payload = this.safeJsonParse(message.body);
        if (payload) {
          this.handleIncomingMessage(payload);
        }
      },
      { id: newSubId }
    );
  }

  private handleIncomingMessage(payload: ChatPayload) {
    this.logDebug('[chat] recibido payload', payload);
    const texto = this.toText(payload.mensaje ?? payload.texto);
    if (!texto) {
      return;
    }
    const turistaId = this.toNumber(payload.idTurista ?? payload.turista?.idTurista);
    const empresaId = this.toNumber(payload.idEmpresa ?? payload.empresa?.idEmpresa);
    const idConversacion = this.toNumber(payload.idConversacion);
    const nombreTurista = this.toText(payload.nombreTurista) || undefined;
    const nombreEmpresa = this.toText(payload.nombreEmpresa) || undefined;
    const rolEmisor = this.toText(payload.rolEmisor) || undefined;
    const idEmisor = this.toNumber(payload.idEmisor);
    const emisorNombre = this.toText(payload.emisorNombre) || undefined;
    const fecha = this.toText(payload.fechaEnvio ?? payload.fecha);
    const hora = this.formatHoraFromPayload(fecha);
    const esMio = this.resolveEsMio(payload);
    const role = this.resolveUserRole();
    if (empresaId != null && this.currentEmpresaId == null) {
      this.currentEmpresaId = empresaId;
    }
    if (role === 'company' && turistaId != null && this.currentTuristaId !== turistaId) {
      this.currentTuristaId = turistaId;
      this.subscribeToConversation();
    }
    this.pushMensaje({
      texto,
      esMio,
      hora,
      idTurista: turistaId,
      idEmpresa: empresaId,
      idConversacion,
      nombreTurista,
      nombreEmpresa,
      rolEmisor,
      idEmisor,
      emisorNombre
    }, turistaId, empresaId);
  }

  private isMensajeMio(payload: ChatPayload): boolean {
    const turistaId = this.toNumber(
      payload.idTurista ??
      payload.turista?.idTurista
    );
    const empresaId = this.toNumber(
      payload.idEmpresa ??
      payload.empresa?.idEmpresa
    );
    if (this.currentTuristaId != null && turistaId != null) {
      return this.currentTuristaId === turistaId;
    }
    if (this.currentEmpresaId != null && empresaId != null) {
      const role = localStorage.getItem('userRole');
      if (role === 'company') {
        return this.currentEmpresaId === empresaId;
      }
    }
    return false;
  }

  private resolveEsMio(payload: ChatPayload | ChatHistorialRow): boolean {
    const rol = this.toText(payload.rolEmisor).toUpperCase();
    const idEmisor = this.toNumber(payload.idEmisor);
    const role = this.resolveUserRole();
    if (rol === 'TURISTA' && idEmisor != null) {
      return idEmisor === this.getTuristaId();
    }
    if (rol === 'EMPRESA' && idEmisor != null) {
      return idEmisor === this.getEmpresaId();
    }
    if (idEmisor != null) {
      if (role === 'tourist') {
        const turistaId = this.getTuristaId();
        if (turistaId != null) {
          return idEmisor === turistaId;
        }
      }
      if (role === 'company') {
        const empresaId = this.getEmpresaId();
        if (empresaId != null) {
          return idEmisor === empresaId;
        }
      }
    }
    const explicit = this.toBoolean(payload.esMio);
    if (explicit != null) {
      return explicit;
    }
    return this.isMensajeMio(payload as ChatPayload);
  }

  private pushMensaje(msg: ChatMensaje, turistaId: number | null, empresaId: number | null) {
    if (turistaId == null || empresaId == null) {
      return;
    }
    const key = this.getConversationKey(turistaId, empresaId);
    const existing = this.conversacionesMap.get(key);
    const mensajes = existing ? [...existing.mensajes] : [];
    if (msg.idConversacion != null) {
      const exists = mensajes.some((item) => item.idConversacion === msg.idConversacion);
      if (exists) {
        return;
      }
    }
    mensajes.push(msg);
    const nombre = this.resolveConversationName(turistaId, empresaId, msg, existing?.empresa);
    const conv: ChatConversacion = {
      idEmpresa: empresaId,
      idTurista: turistaId,
      empresa: nombre,
      ultimoMensaje: msg.texto,
      hora: msg.hora,
      mensajes,
      updatedAt: Date.now()
    };
    this.conversacionesMap.set(key, conv);
    if (this.activeConversationKey === key) {
      this.mensajesSubject.next([...mensajes]);
    }
    this.updateConversacionesSnapshot();
  }

  private safeJsonParse(payload: string): ChatPayload | null {
    if (!payload) {
      return null;
    }
    try {
      return JSON.parse(payload) as ChatPayload;
    } catch {
      return null;
    }
  }

  private formatHora(fecha: Date): string {
    return fecha.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
  }

  private formatHoraFromPayload(value: string): string {
    if (!value) {
      return this.formatHora(new Date());
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return this.formatHora(new Date());
    }
    return this.formatHora(parsed);
  }

  private getTuristaId(): number | null {
    const stored = localStorage.getItem('id_turista') ?? localStorage.getItem('idTurista');
    const id = stored ? Number(stored) : null;
    return Number.isFinite(id) ? id : null;
  }

  private getEmpresaId(): number | null {
    const stored = localStorage.getItem('idempresa')
      ?? localStorage.getItem('empresaId')
      ?? localStorage.getItem('id_empresa')
      ?? localStorage.getItem('idEmpresa');
    const id = stored ? Number(stored) : null;
    return Number.isFinite(id) ? id : null;
  }

  isCompanyRole(): boolean {
    return this.resolveUserRole() === 'company';
  }

  private ensureEmpresaId(): number | null {
    if (this.currentEmpresaId != null) {
      return this.currentEmpresaId;
    }
    const stored = this.getEmpresaId();
    if (stored != null) {
      this.currentEmpresaId = stored;
    }
    return this.currentEmpresaId;
  }

  private ensureTuristaId(): number | null {
    if (this.currentTuristaId != null) {
      return this.currentTuristaId;
    }
    const stored = this.getTuristaId();
    if (stored != null) {
      this.currentTuristaId = stored;
    }
    return this.currentTuristaId;
  }

  private resolveUserRole(): 'company' | 'tourist' | null {
    const raw = (localStorage.getItem('userRole') ?? '').trim();
    const upper = raw.toUpperCase();
    if (raw === 'company' || upper === 'ROLE_EMPRESA' || upper === 'EMPRESA') {
      return 'company';
    }
    if (raw === 'tourist' || upper === 'ROLE_TURISTA' || upper === 'TURISTA') {
      return 'tourist';
    }
    if (this.getTuristaId() != null) {
      return 'tourist';
    }
    if (this.getEmpresaId() != null) {
      return 'company';
    }
    return null;
  }

  private getRolEmisor(): string | null {
    const role = this.resolveUserRole();
    if (role === 'tourist') {
      return 'TURISTA';
    }
    if (role === 'company') {
      return 'EMPRESA';
    }
    return null;
  }

  private getConversationKey(turistaId: number, empresaId: number): string {
    return `${turistaId}-${empresaId}`;
  }

  private ensureCacheLoaded() {
    const key = this.getCacheKey();
    if (!key) {
      return;
    }
    if (this.cacheLoaded && this.cacheKey === key) {
      return;
    }
    this.cacheKey = key;
    this.cacheLoaded = true;
    this.conversacionesMap.clear();
    const raw = localStorage.getItem(key);
    if (!raw) {
      this.updateConversacionesSnapshot();
      return;
    }
    try {
      const parsed = JSON.parse(raw) as ChatConversacion[];
      if (!Array.isArray(parsed)) {
        this.updateConversacionesSnapshot();
        return;
      }
      for (const conv of parsed) {
        if (!conv || !Number.isFinite(Number(conv.idEmpresa))) {
          continue;
        }
        const turistaId = conv.idTurista == null ? null : Number(conv.idTurista);
        const empresaId = Number(conv.idEmpresa);
        if (turistaId == null) {
          continue;
        }
        const keyConv = this.getConversationKey(turistaId, empresaId);
        const mensajes = Array.isArray(conv.mensajes) ? conv.mensajes : [];
        const cleaned: ChatConversacion = {
          idEmpresa: empresaId,
          idTurista: turistaId,
          empresa: (conv.empresa ?? '').toString(),
          ultimoMensaje: (conv.ultimoMensaje ?? '').toString(),
          hora: (conv.hora ?? '').toString(),
          mensajes,
          updatedAt: conv.updatedAt ?? Date.now()
        };
        this.conversacionesMap.set(keyConv, cleaned);
      }
    } catch {
      this.conversacionesMap.clear();
    }
    this.updateConversacionesSnapshot();
  }

  private getCacheKey(): string | null {
    const role = this.resolveUserRole();
    if (role === 'tourist') {
      const id = this.getTuristaId();
      return id != null ? `chat_conversaciones_turista_${id}` : null;
    }
    if (role === 'company') {
      const id = this.getEmpresaId();
      return id != null ? `chat_conversaciones_empresa_${id}` : null;
    }
    return null;
  }

  private persistCache() {
    const key = this.cacheKey ?? this.getCacheKey();
    if (!key) {
      return;
    }
    const list = Array.from(this.conversacionesMap.values()).map((conv) => ({
      ...conv,
      mensajes: conv.mensajes.slice(-this.maxCachedMessages)
    }));
    try {
      localStorage.setItem(key, JSON.stringify(list));
    } catch {
      // ignore storage errors
    }
  }

  private updateConversacionesSnapshot() {
    const list = Array.from(this.conversacionesMap.values());
    list.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
    this.conversacionesSubject.next(list);
    this.persistCache();
  }

  private syncMisChats() {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    this.http.get<ChatResumenRow[]>(this.misChatsUrl, { headers }).subscribe({
      next: (rows) => {
        this.logDebug('[chat] mis-chats raw', rows);
        this.applyMisChats(rows);
      },
      error: () => {
        this.logDebug('[chat] mis-chats error');
      }
    });
  }

  private applyMisChats(rows: ChatResumenRow[]) {
    if (!Array.isArray(rows)) {
      return;
    }
    const role = this.resolveUserRole();
    for (const row of rows) {
      const turistaId = this.toNumber(row.idTurista);
      const empresaId = this.toNumber(row.idEmpresa);
      if (turistaId == null || empresaId == null) {
        continue;
      }
      const key = this.getConversationKey(turistaId, empresaId);
      const existing = this.conversacionesMap.get(key);
      const nombreTurista = this.toText(row.nombreTurista);
      const nombreEmpresa = this.toText(row.nombreEmpresa);
      const displayName = role === 'company'
        ? (nombreTurista || existing?.empresa || `Turista #${turistaId}`)
        : (nombreEmpresa || existing?.empresa || `Empresa #${empresaId}`);
      const ultimoMensaje = this.toText(row.ultimoMensaje) || existing?.ultimoMensaje || 'Sin mensajes';
      const fechaRaw = this.toText(row.fechaUltimoMensaje);
      const hora = fechaRaw
        ? this.formatHoraFromPayload(fechaRaw)
        : (existing?.hora || 'Ahora');
      const updatedAt = this.toMillis(fechaRaw) ?? existing?.updatedAt ?? Date.now();
      const mensajes = existing?.mensajes ?? [];
      this.conversacionesMap.set(key, {
        idEmpresa: empresaId,
        idTurista: turistaId,
        empresa: displayName,
        ultimoMensaje,
        hora,
        mensajes,
        updatedAt
      });
    }
    this.updateConversacionesSnapshot();
  }

  private storeHistory(
    history: ChatMensaje[],
    turistaId: number | null,
    empresaId: number | null
  ) {
    if (turistaId == null || empresaId == null) {
      return;
    }
    const key = this.getConversationKey(turistaId, empresaId);
    const existing = this.conversacionesMap.get(key);
    const merged = existing
      ? this.mergeMessages(existing.mensajes, history)
      : [...history];
    const last = merged[merged.length - 1];
    const nombre = this.resolveConversationName(turistaId, empresaId, last, existing?.empresa);
    const conv: ChatConversacion = {
      idEmpresa: empresaId,
      idTurista: turistaId,
      empresa: nombre,
      ultimoMensaje: last?.texto ?? existing?.ultimoMensaje ?? 'Sin mensajes',
      hora: last?.hora ?? existing?.hora ?? 'Ahora',
      mensajes: merged,
      updatedAt: Date.now()
    };
    this.conversacionesMap.set(key, conv);
    if (this.activeConversationKey === key) {
      this.mensajesSubject.next([...merged]);
    }
    this.updateConversacionesSnapshot();
  }

  private mergeMessages(existing: ChatMensaje[], incoming: ChatMensaje[]): ChatMensaje[] {
    if (!existing.length) {
      return [...incoming];
    }
    const ids = new Set(existing.map((item) => item.idConversacion).filter((id): id is number => id != null));
    const merged = [...existing];
    for (const msg of incoming) {
      if (msg.idConversacion != null && ids.has(msg.idConversacion)) {
        continue;
      }
      merged.push(msg);
    }
    return merged;
  }

  private resolveConversationName(
    turistaId: number,
    empresaId: number,
    msg?: ChatMensaje,
    fallback?: string
  ): string {
    const role = this.resolveUserRole();
    if (role === 'company') {
      const nombre = (msg?.nombreTurista ?? msg?.emisorNombre ?? '').trim();
      return nombre || fallback || `Turista #${turistaId}`;
    }
    const nombreEmpresa = (msg?.nombreEmpresa ?? '').trim();
    if (nombreEmpresa) {
      return nombreEmpresa;
    }
    if (fallback) {
      return fallback;
    }
    if (this.currentEmpresaNombre) {
      return this.currentEmpresaNombre;
    }
    return `Empresa #${empresaId}`;
  }

  private cargarHistorial(idTurista: number, idEmpresa: number) {
    const url = `${this.historialUrl}?idTurista=${idTurista}&idEmpresa=${idEmpresa}`;
    const token = localStorage.getItem('token');
    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
    return this.http.get<ChatHistorialRow[]>(url, { headers });
  }

  private toNumber(value: unknown): number | null {
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  }

  private toMillis(value: string): number | null {
    if (!value) {
      return null;
    }
    const time = Date.parse(value);
    return Number.isNaN(time) ? null : time;
  }

  private toBoolean(value: unknown): boolean | null {
    if (value === true || value === false) {
      return value;
    }
    if (typeof value === 'string') {
      const clean = value.trim().toLowerCase();
      if (clean === 'true') {
        return true;
      }
      if (clean === 'false') {
        return false;
      }
    }
    return null;
  }

  private toText(value: unknown): string {
    if (value == null) {
      return '';
    }
    return String(value).trim();
  }

  private logDebug(message: string, data?: unknown) {
    if (!this.debug) {
      return;
    }
    if (data !== undefined) {
      console.log(message, data);
      return;
    }
    console.log(message);
  }
}
