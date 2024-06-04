import { Component, OnInit } from '@angular/core';
import { UserProfileService } from '../../../services/user-profile.service';

@Component({
  selector: 'app-chat-view',
  templateUrl: './chat-view.component.html',
  styleUrl: './chat-view.component.scss'
})
export class ChatViewComponent implements OnInit {
  currentUserId: number = 0;
  chatId: number = 0; //change to chatDto later

  constructor(
    private userService: UserProfileService
  ){}

  ngOnInit(): void {
    this.currentUserId = this.userService.getUserIdFromToken();
    this.chatId = 1; //Get value from chatService.
  }


}
