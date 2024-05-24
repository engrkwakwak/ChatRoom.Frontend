import { Component } from '@angular/core';
import { ChatService } from '../chat.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-chat-index',
  templateUrl: './chat-index.component.html',
  styleUrl: './chat-index.component.scss'
})
export class ChatIndexComponent {
  constructor(
    private chatService : ChatService,
    private jwtHelper: JwtHelperService,
    private authService : AuthService
  ){}

  ngOnInit(): void {}
}
