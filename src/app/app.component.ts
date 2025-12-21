import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatFlotanteTComponent } from "./chat/chat-flotante-t/chat-flotante-t.component";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ChatFlotanteTComponent, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Front-Turismo';
}
