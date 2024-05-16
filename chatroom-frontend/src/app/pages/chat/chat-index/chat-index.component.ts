import { Component } from '@angular/core';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-chat-index',
  templateUrl: './chat-index.component.html',
  styleUrl: './chat-index.component.scss'
})
export class ChatIndexComponent {
  constructor(
    private chatService : ChatService
  ){}
}
