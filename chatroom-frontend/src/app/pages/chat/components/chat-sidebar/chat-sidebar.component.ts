import { Component, Inject, OnInit } from '@angular/core';
import { ChatService } from '../../chat.service';
import { Router } from '@angular/router';
import { NB_WINDOW, NbMenuService, NbWindowControlButtonsConfig, NbWindowService } from '@nebular/theme';
import { filter, map } from 'rxjs/operators';
import { UserProfileComponent } from '../user-profile/user-profile.component';
import { jwtDecode } from 'jwt-decode'; 
import { UserProfileService } from '../../../../services/user-profile.service';
import { UserDto } from '../../../../dtos/chat/user.dto';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-chat-sidebar',
  templateUrl: './chat-sidebar.component.html',
  styleUrl: './chat-sidebar.component.scss'
})
export class ChatSidebarComponent implements OnInit {
  username: string = '';

  constructor(
    private chatService : ChatService,
    private router : Router,
    private nbMenuService: NbMenuService,
    @Inject(NB_WINDOW) private window : Window,
    private nbWindowService: NbWindowService,
    private userService: UserProfileService
  ){}

  ngOnInit() {
    this.nbMenuService.onItemClick()
      .pipe(
        filter(({ tag }) => tag === 'user-actions-menu'),
        map(({ item: { title } }) => title),
      )
      .subscribe(title => {
        if(title === 'Logout'){
          this.logOut();
        }
        else if(title === 'Profile'){
          this.viewUserProfile();
        }
      });
      this.loadDisplayName();
  }

  users: { name: string, title: string }[] = [
    { name: 'Carla Espinosa', title: 'Nurse' },
    { name: 'Bob Kelso', title: 'Doctor of Medicine' },
    { name: 'Janitor', title: 'Janitor' },
    { name: 'Perry Cox', title: 'Doctor of Medicine' },
    { name: 'Ben Sullivan', title: 'Carpenter and photographer' },
  ];

  userActionItems: {title: string}[] = [
    { title: 'Profile' },
    { title: 'Logout' }
  ]

  hideChatlist(){
    this.chatService.hideChatlist()
  }

  viewChat(){
    if(this.chatService.isMobile){
      this.hideChatlist();
    }
    this.router.navigate(['/chat/view/1']);
  }

  viewUserProfile(){
    const buttonsConfig: NbWindowControlButtonsConfig = {
      minimize: false,
      maximize: false,
      fullScreen: false,
      close: true
    };
    const windowRef = this.nbWindowService.open(UserProfileComponent, { buttons: buttonsConfig } );

    windowRef.onClose.subscribe(() => {
      this.loadDisplayName();
    });
  }

  private loadDisplayName() : void {
    var userId: number = 0;
    const token = localStorage.getItem('chatroom-token');
    if(token){
      const decodedToken = jwtDecode<any>(token);
      userId = decodedToken['sub'];
    }
    const userByIdUri: string = `/users/${userId}`;
  
    this.userService.getUser(userByIdUri)
    .subscribe({
      next: (userEntity: UserDto) => {
        this.username = userEntity.displayName;
        
      },
      error: (err: HttpErrorResponse) => console.log(err),
    })
  }

  logOut = () => {
    localStorage.removeItem("chatroom-token");
    this.router.navigate(['/signin'])
  }
}
