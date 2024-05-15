import { Component } from '@angular/core';
import { ChatService } from '../../chat.service';

@Component({
  selector: 'app-chatlist-toggle',
  templateUrl: './chatlist-toggle.component.html',
  styleUrl: './chatlist-toggle.component.scss'
})
export class ChatlistToggleComponent {
  constructor(
    public chatService : ChatService
  ){}

  showChatlist(){
    this.chatService.showChatlist();
  }
}
