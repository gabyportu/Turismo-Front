import { Component, Output, EventEmitter} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule, Form, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; 
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-step1-company',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    FormsModule,
    MatTabsModule
  ],
  templateUrl: './step1-company.component.html',
  styleUrl: './step1-company.component.css'
})
export class Step1CompanyComponent {

  @Output() next = new EventEmitter<any>();

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    nit: ['', [Validators.required]],
    descripcion: ['', [Validators.required]],
    ciudad: ['', [Validators.required]],
    telefono: ['', [Validators.required]]
  });

  logo: string | null = null;

  constructor(
    private fb: FormBuilder
  ) {}

  onLogoSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.logo = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onNext(){
    if(this.form.valid){
      this.next.emit({
        ...this.form.value, logo: this.logo
      });
    }else{
      this.form.markAllAsTouched();
    }
  }

  submit(){
    if(this.form.valid){
      this.next.emit();
    }else{
      this.form.markAllAsTouched();
    }
  }
}
