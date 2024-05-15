import { Component, HostListener, ViewChild } from '@angular/core';
import { NbMenuItem } from '@nebular/theme';
import { ChatlistComponent } from './components/chatlist/chatlist.component';
import { ChatService } from './chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  
  constructor(
    public chatService : ChatService
  ){}


  ngOnInit(){
    this.chatService.showChatlistByScreenWidth(window!.innerWidth)
  }

  @HostListener('window:resize', ['$event'])
  onResize(){
    this.chatService.showChatlistByScreenWidth(window!.innerWidth)
  }

}
