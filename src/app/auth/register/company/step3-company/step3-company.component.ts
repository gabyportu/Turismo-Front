import { Component,EventEmitter, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-step3-company',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    RouterModule
  ],
  templateUrl: './step3-company.component.html',
  styleUrl: './step3-company.component.css'
})
export class Step3CompanyComponent {
  @Output() back = new EventEmitter<void>();
  @Output() finish = new EventEmitter<{ documents: File[] }>();

  files: { [key: number]: File | null } = {1:null, 2:null, 3:null};
  submitted = false;

  backStep() {
    this.back.emit();
  }

  finalizar() {
    this.submitted = true;
    if (!this.files[1] || !this.files[2]) {
      return;
    }
    const documents = [this.files[1], this.files[2], this.files[3]].filter(Boolean) as File[];
    this.finish.emit({ documents });
  }

  onFileSelected(event: any, index: number) {
    const file: File = event.target.files[0];
    if (file) {
      this.files[index] = file;
    }
  }
}
