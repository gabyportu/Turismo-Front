import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private abrirChatSubject = new Subject<string>();
  abrirChat$ = this.abrirChatSubject.asObservable();

  abrirChat(empresa: string) {
    this.abrirChatSubject.next(empresa);
  }
}