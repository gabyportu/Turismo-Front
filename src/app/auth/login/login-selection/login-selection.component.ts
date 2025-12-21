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
    RouterModule
  ],
  templateUrl: './login-selection.component.html',
  styleUrls: ['./login-selection.component.css']
})
export class LoginSelectionComponent {
  username: string = '';
  password: string = '';

  selected: 'company' | 'tourist' | null = null;
  tab: 'login' | 'admin' = 'login';

  constructor(private router: Router) {}

  selectRole(role: 'company' | 'tourist') {
    this.selected = role;
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

  loginTourist(){
    localStorage.setItem('userLoggendIn', 'true');
    localStorage.setItem('userRole', 'tourist');
    this.router.navigate(['/home/publi-home']);
  }

  loginCompany(){
    const empresaId = 1
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('userRole', 'company');
    localStorage.setItem('empresaId', empresaId.toString());
    this.router.navigate(['/empresa/perfil', empresaId]);
  }

  loginAdmin(){
    localStorage.setItem('adminLoggedIn', 'true');
    this.router.navigate(['/admin/users-company'])
  }
}