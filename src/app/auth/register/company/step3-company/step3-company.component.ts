import { Component,EventEmitter, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-step3-company',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './step3-company.component.html',
  styleUrl: './step3-company.component.css'
})
export class Step3CompanyComponent {
  @Output() back = new EventEmitter<void>();
  @Output() finish = new EventEmitter<void>();

  files: { [key: number]: File | null } = {1:null, 2:null, 3:null};

  backStep() {
    this.back.emit();
  }

  finalizar() {
    this.finish.emit();
  }

  onFileSelected(event: any, index: number) {
    const file: File = event.target.files[0];
    if (file) {
      this.files[index] = file;
    }
  }
}
