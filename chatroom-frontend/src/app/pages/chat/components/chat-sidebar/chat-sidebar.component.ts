import { Component } from '@angular/core';
import { ChatService } from '../../chat.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat-sidebar',
  templateUrl: './chat-sidebar.component.html',
  styleUrl: './chat-sidebar.component.scss'
})
export class ChatSidebarComponent {
  constructor(
    private chatService : ChatService,
    private router : Router
  ){}

  users: { name: string, title: string }[] = [
    { name: 'Carla Espinosa', title: 'Nurse' },
    { name: 'Bob Kelso', title: 'Doctor of Medicine' },
    { name: 'Janitor', title: 'Janitor' },
    { name: 'Perry Cox', title: 'Doctor of Medicine' },
    { name: 'Ben Sullivan', title: 'Carpenter and photographer' },
  ];

  hideChatlist(){
    this.chatService.hideChatlist()
  }

  viewChat(){
    if(this.chatService.isMobile){
      this.hideChatlist();
    }
    this.router.navigate(['/chat/view/1']);
  }
}
