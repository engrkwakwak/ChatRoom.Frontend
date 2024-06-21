import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NB_WINDOW, NbDialogService, NbMenuService, NbToastrService, NbWindowControlButtonsConfig, NbWindowService } from '@nebular/theme';
import { filter, map } from 'rxjs/operators';
import { UserProfileComponent } from '../user-profile/user-profile.component';
import { jwtDecode } from 'jwt-decode'; 
import { UserProfileService } from '../../../../services/user-profile.service';
import { UserDto } from '../../../../dtos/chat/user.dto';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../../environments/environment.development';
import { SignalRService } from '../../../../services/signal-r.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { AuthService } from '../../../../services/auth.service';
import { ErrorHandlerService } from '../../../../services/error-handler.service';
import { ChatService } from '../../../../services/chat.service';

@Component({
  selector: 'app-chat-sidebar',
  templateUrl: './chat-sidebar.component.html',
  styleUrl: './chat-sidebar.component.scss'
})
export class ChatSidebarComponent implements OnInit {
  username: string = '';
  picturePath: string = '';
  @ViewChild('changePasswordDialog') changePasswordDialog? : ConfirmationDialogComponent;

  constructor(
    private chatService : ChatService,
    private router : Router,
    private nbMenuService: NbMenuService,
    @Inject(NB_WINDOW) private window : Window,
    private dialogService: NbDialogService,
    private userProfileService: UserProfileService,
    private cdr: ChangeDetectorRef,
    private signalRService: SignalRService,
    private authService : AuthService,
    private errorHandlerService : ErrorHandlerService,
    private nbToastService : NbToastrService,

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
        if(title === 'Profile'){
          this.viewUserProfile();
        }
        if(title === 'Change Password'){
          this.changePassword();
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
    { title: 'Change Password' },
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
    const userId: number = this.userProfileService.getUserIdFromToken();
    this.dialogService.open(UserProfileComponent, {
      context: {
        userId: userId
      }
    }).onClose.subscribe(() => {
      this.loadDisplayName();
    });
  }

  changePassword(){
    this.changePasswordDialog?.open();
  }

  sendPasswordResetLink(){
    this.changePasswordDialog!.loading = true;
    this.authService.sendPasswordResetLink(this.userProfileService.getUserIdFromToken())
    .subscribe({
      next : _ =>  {
        this.changePasswordDialog?.close()
        this.nbToastService.success("Password reset link was sent successfully. Please check your email.", "Email Sent Successfully",
        {
          duration : 4000
        });
      },
      error : err => this.errorHandlerService.handleError(err),
      complete : () => this.changePasswordDialog!.loading = false
    })
  }

  private loadDisplayName() : void {
    var userId: number = 0;
    const token = localStorage.getItem('chatroom-token');
    if(token){
      const decodedToken = jwtDecode<any>(token);
      userId = decodedToken['sub'];
    }
    const userByIdUri: string = `/users/${userId}`;
  
    this.userProfileService.getUser(userByIdUri)
    .subscribe({
      next: (userEntity: UserDto) => {
        this.username = userEntity.displayName;
        this.updatePicturePath(userEntity.displayPictureUrl ?? "");
      },
      error: (err: HttpErrorResponse) => console.log(err),
    })
  }

  logOut = () => {
    this.signalRService.stopConnection();
    localStorage.removeItem("chatroom-token");
    this.router.navigate(['/signin']);
  }

  public loadDisplayPicture() : string {
    return this.userProfileService.loadDisplayPicture(this.picturePath, this.username);
  }

  public updatePicturePath(newPath: string): void{
    this.picturePath = newPath;
    this.cdr.detectChanges();
  }
}
