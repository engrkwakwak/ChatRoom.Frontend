import { Component } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthService } from '../../../services/auth.service';
import { MenuItem } from 'primeng/api';
import { UserProfileService } from '../../../services/user-profile.service';
import { UserDto } from '../../../dtos/chat/user.dto';

@Component({
  selector: 'app-chat-index',
  templateUrl: './chat-index.component.html',
  styleUrl: './chat-index.component.scss'
})
export class ChatIndexComponent {
  constructor(
    private jwtHelper: JwtHelperService,
    private authService : AuthService,
    private userProfileService : UserProfileService
  ){}

  user? : UserDto;

  ngOnInit(): void {
    const userId : number = this.userProfileService.getUserIdFromToken();
    this.userProfileService.getUser(`/users/${userId}`)
    .subscribe((user) => {
      this.user = user
    });
  }
}
