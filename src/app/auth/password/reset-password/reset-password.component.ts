import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  token = '';
  nuevaPassword = '';
  confirmPassword = '';
  noticeMessage: string | null = null;
  noticeType: 'success' | 'error' | null = null;
  showPassword = false;
  showConfirmPassword = false;
  isSubmitting = false;
  hasToken = false;

  private readonly resetPasswordUrl = '/auth/password/reset';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.token = token;
      this.hasToken = true;
    } else {
      this.setNotice('error', 'No se encontro un token valido. Solicita el enlace otra vez.');
    }
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
      return;
    }
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  private setNotice(type: 'success' | 'error', message: string) {
    this.noticeType = type;
    this.noticeMessage = message;
  }

  private clearNotice() {
    this.noticeType = null;
    this.noticeMessage = null;
  }

  submitReset() {
    if (this.isSubmitting) {
      return;
    }
    this.clearNotice();
    const token = this.token.trim();
    if (!token) {
      this.setNotice('error', 'No se encontro un token valido. Solicita el enlace otra vez.');
      return;
    }
    if (!this.nuevaPassword) {
      this.setNotice('error', 'Ingresa la nueva contrasena.');
      return;
    }
    if (!this.confirmPassword) {
      this.setNotice('error', 'Confirma la nueva contrasena.');
      return;
    }
    if (this.nuevaPassword !== this.confirmPassword) {
      this.setNotice('error', 'Las contrasenas no coinciden.');
      return;
    }

    this.isSubmitting = true;
    this.http.post(this.resetPasswordUrl, { token, nuevaPassword: this.nuevaPassword }, { responseType: 'text' }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.setNotice('success', 'Contrasena actualizada. Ya puedes iniciar sesion.');
      },
      error: () => {
        this.isSubmitting = false;
        this.setNotice('error', 'No se pudo actualizar la contrasena. Verifica el token.');
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
