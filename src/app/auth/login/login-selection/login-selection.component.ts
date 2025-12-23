import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface LoginResponse {
  token: string;
  role?: string | null;
  idUsuario?: number | null;
  id_usuario?: number | null;
  idTurista?: number | null;
  id_turista?: number | null;
  idEmpresa?: number | null;
  id_empresa?: number | null;
  idempresa?: number | null;
  idRepresentante?: number | null;
  id_representante?: number | null;
  idrepresentante?: number | null;
}

@Component({
  selector: 'app-login-selection',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './login-selection.component.html',
  styleUrls: ['./login-selection.component.css']
})
export class LoginSelectionComponent {
  correo: string = '';
  password: string = '';
  noticeMessage: string | null = null;
  noticeType: 'success' | 'error' | null = null;
  showPassword: boolean = false;

  selected: 'company' | 'tourist' | null = null;
  tab: 'login' | 'admin' = 'login';

  private readonly loginUrl = 'http://localhost:8112/auth/login';

  constructor(private router: Router, private http: HttpClient) {}

  selectRole(role: 'company' | 'tourist') {
    this.selected = role;
    this.clearNotice();
  }

  goToRegister() {
    if(!this.selected) {
      alert('Por favor, selecciona Empresa o Turista antes de registrarte.');
      return;
    }
    if (this.selected === 'company') {
      this.router.navigate(['/register/company']);
    } else if (this.selected === 'tourist') {
      this.router.navigate(['/register/tourist']);
    }
  }

  loginTourist() {
    this.login();
  }

  loginCompany() {
    this.login();
  }

  loginAdmin(){
    this.selected = null;
    this.login();
  }

  private firstNumber(...values: Array<number | null | undefined>) {
    for (const value of values) {
      if (value != null) {
        return value;
      }
    }
    return null;
  }

  private setNotice(type: 'success' | 'error', message: string) {
    this.noticeType = type;
    this.noticeMessage = message;
  }

  private clearNotice() {
    this.noticeType = null;
    this.noticeMessage = null;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  private persistSession(
    token: string | null | undefined,
    idUsuario: number | null,
    idTurista: number | null,
    idEmpresa: number | null
  ) {
    if (token) {
      localStorage.setItem('token', token);
    }
    if (idUsuario != null) {
      localStorage.setItem('id_usuario', idUsuario.toString());
    }
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('userLoggendIn', 'true');

    localStorage.removeItem('id_turista');
    localStorage.removeItem('idempresa');
    localStorage.removeItem('empresaId');

    if (idTurista != null) {
      localStorage.setItem('id_turista', idTurista.toString());
    }

    if (idEmpresa != null) {
      localStorage.setItem('idempresa', idEmpresa.toString());
      localStorage.setItem('empresaId', idEmpresa.toString());
    }
  }

  private navigateWithSuccess(route: Array<string | number>) {
    this.setNotice('success', 'Usuario ingresado correctamente.');
    setTimeout(() => {
      this.router.navigate(route);
    }, 500);
  }

  private login() {
    this.clearNotice();
    if (!this.correo || !this.password) {
      this.setNotice('error', 'Completa el correo y la contrasena.');
      return;
    }

    const payload = { correo: this.correo, password: this.password };

    this.http.post<LoginResponse>(this.loginUrl, payload).subscribe({
      next: (response) => {
        const idUsuario = this.firstNumber(response.idUsuario, response.id_usuario);
        const idTurista = this.firstNumber(response.idTurista, response.id_turista);
        const idEmpresa = this.firstNumber(response.idEmpresa, response.id_empresa, response.idempresa);
        const idRepresentante = this.firstNumber(
          response.idRepresentante,
          response.id_representante,
          response.idrepresentante
        );

        let role = response.role ?? null;
        if (!role) {
          if (idTurista != null) {
            role = 'ROLE_TURISTA';
          } else if (idEmpresa != null || idRepresentante != null) {
            role = 'ROLE_EMPRESA';
          } else if (idUsuario != null) {
            role = 'ROLE_ADMIN';
          }
        }

        if (this.tab === 'admin' && role !== 'ROLE_ADMIN') {
          this.setNotice('error', 'Este usuario no esta registrado como administrador.');
          return;
        }

        if (this.selected === 'company' && role !== 'ROLE_EMPRESA') {
          this.setNotice('error', 'Este usuario no esta registrado como empresa.');
          return;
        }

        if (this.selected === 'tourist' && role !== 'ROLE_TURISTA') {
          this.setNotice('error', 'Este usuario no esta registrado como turista.');
          return;
        }

        if (role === 'ROLE_TURISTA') {
          this.persistSession(response.token, idUsuario, idTurista, idEmpresa);
          localStorage.setItem('userRole', 'tourist');
          this.navigateWithSuccess(['/home/publi-home']);
          return;
        }

        if (role === 'ROLE_EMPRESA') {
          const empresaRutaId = idEmpresa ?? idUsuario;
          if (empresaRutaId == null) {
            this.setNotice('error', 'No se encontro el id de la empresa.');
            return;
          }
          this.persistSession(response.token, idUsuario, idTurista, idEmpresa);
          localStorage.setItem('userRole', 'company');
          this.navigateWithSuccess(['/empresa/perfil', empresaRutaId]);
          return;
        }

        if (role === 'ROLE_ADMIN') {
          this.persistSession(response.token, idUsuario, idTurista, idEmpresa);
          localStorage.setItem('adminLoggedIn', 'true');
          this.navigateWithSuccess(['/admin/users-company']);
          return;
        }

        if (this.selected === 'company') {
          const empresaRutaId = idEmpresa ?? idUsuario;
          if (empresaRutaId == null) {
            this.setNotice('error', 'No se encontro el id de la empresa.');
            return;
          }
          this.persistSession(response.token, idUsuario, idTurista, idEmpresa);
          localStorage.setItem('userRole', 'company');
          this.navigateWithSuccess(['/empresa/perfil', empresaRutaId]);
          return;
        }

        this.persistSession(response.token, idUsuario, idTurista, idEmpresa);
        localStorage.setItem('userRole', 'tourist');
        this.navigateWithSuccess(['/home/publi-home']);
      },
      error: () => {
        this.setNotice('error', 'Usuario o contrasena incorrectos.');
      }
    });
  }
}


