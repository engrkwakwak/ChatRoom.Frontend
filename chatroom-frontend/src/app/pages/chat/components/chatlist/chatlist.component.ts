import { Component } from '@angular/core';
import { ChatService } from '../../chat.service';
import { privateDecrypt } from 'crypto';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chatlist',
  templateUrl: './chatlist.component.html',
  styleUrl: './chatlist.component.scss'
})
export class ChatlistComponent {
  constructor(
    private chatModuleService : ChatService,
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
    this.chatModuleService.hideChatlist()
  }

  viewChat(){
    if(this.chatModuleService.isMobile){
      this.hideChatlist();
    }
    this.router.navigate(['/chat/view/from-chatlist/1']);
  }
}
