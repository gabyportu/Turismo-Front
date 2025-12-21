import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-nueva-oferta',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    ReactiveFormsModule,
  ],
  templateUrl: './nueva-oferta.component.html',
  styleUrl: './nueva-oferta.component.css'
})
export class NuevaOfertaComponent {
  fotoPrincipal: string | null = null;
  fotosAdicionales: string[] = [];
  videoPreview: string | null = null;
  ofertaForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router){
    this.ofertaForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(10)]],
      descripcion: ['', [Validators.required, Validators.minLength(50)]],
      precio: ['', [Validators.required, Validators.min(100)]],
      duracion: ['', Validators.required],
      incluye: ['', Validators.required],
      noIncluye: [''],
      itinerario: ['', Validators.required],
      cupos: ['', [Validators.required, Validators.min(1)]],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required]
    });
  }

  onFotoPrincipal(event: any){
    const file = event.target.files[0];
    if(file){
      const reader = new FileReader();
      reader.onload = () => this.fotoPrincipal = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  onFotosAdicionales(event: any){
    const files = event.target.files;
    for(let i=0; i<files.length; i++){
      if(this.fotosAdicionales.length >= 5) break;
      const reader = new FileReader();
      reader.onload = () => {
        this.fotosAdicionales.push(reader.result as string);
        this.fotosAdicionales = [...this.fotosAdicionales];
      };
      reader.readAsDataURL(files[i]);
    }
  }

  onVideo(event: any){
    const file = event.target.files[0];
    if(file && file.type.includes('video')){
      const reader = new FileReader();
      reader.onload = () => this.videoPreview = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  eliminarFotoAdicional(index: number){
    this.fotosAdicionales.splice(index, 1);
    this.fotosAdicionales = [...this.fotosAdicionales];
  }

  publicarOferta(){
    if(this.ofertaForm.valid){
      console.log('Oferta publicada:', this.ofertaForm.value);
      alert('oferta mandada a pendiente');
      this.router.navigate(['/empresa/perfil/1']);
    } else {
      alert('Por favor completa todos los campos obligatorios');
    }
  }

  cancelar(){
    this.router.navigate(['/empresa/perfil/1']);
  }
}
