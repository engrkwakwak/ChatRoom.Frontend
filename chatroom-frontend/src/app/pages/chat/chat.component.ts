import { Component, HostListener, ViewChild } from '@angular/core';
import { ChatService } from './chat.service';
import { SignalRService } from '../../services/signal-r.service';
import { tokenGetter } from '../../app.module';
import { UserProfileService } from '../../services/user-profile.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  
  constructor(
    public chatService : ChatService,
    public userService : UserProfileService,
    public signalRService : SignalRService
  ){}


  ngOnInit(){
    this.chatService.showChatlistByScreenWidth(window!.innerWidth)
    this.signalRService.updateConnection(tokenGetter());
  }

  @HostListener('window:resize', ['$event'])
  onResize(){
    this.chatService.showChatlistByScreenWidth(window!.innerWidth)
  }
}
