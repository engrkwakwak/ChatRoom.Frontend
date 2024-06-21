import { Component, ErrorHandler, EventEmitter, Input, Output, ViewChild, input } from '@angular/core';
import { ChatMemberDto } from '../../../../dtos/chat/chat-member.dto';
import { UserProfileService } from '../../../../services/user-profile.service';
import { Menu } from 'primeng/menu';
import { NbMenuItem, NbMenuService } from '@nebular/theme';
import { filter, map } from 'rxjs';
import { UserDto } from '../../../../dtos/chat/user.dto';
import { ChatService } from '../../../../services/chat.service';
import { ChatDto } from '../../../../dtos/chat/chat.dto';
import { ErrorHandlerService } from '../../../../services/error-handler.service';

@Component({
  selector: 'app-chat-member-item',
  templateUrl: './chat-member-item.component.html',
  styleUrl: './chat-member-item.component.scss'
})
export class ChatMemberItemComponent {
  
  constructor(
    private userProfileService : UserProfileService,
    private nbMenuService : NbMenuService,
    private chatService : ChatService,
    private errorHandlerService : ErrorHandlerService
  ){}
  
  userId? : number;
  @Input({required:true}) chat? : ChatDto;
  @Input({required:true}) type : string = "member";
  @Input() member? : ChatMemberDto;
  @Input() user? : UserDto;
  @ViewChild("menu") menu? : Menu;
  @Output() onMemberAdded : EventEmitter<ChatMemberDto> = new EventEmitter<ChatMemberDto>();

  ngOnInit(): void {
    this.userId = this.userProfileService.getUserIdFromToken()
    this.nbMenuService.onItemClick()
      .pipe(
        filter(({ tag  }) => tag === `member-actions-menu-${this.member?.user.userId}`),
        map(({ item: { title } }) => title),
      )
      .subscribe(title => {
        if(title === 'Remove Member'){
          // this.logOut();
        }
        if(title === 'Set as Admin'){
          this.setAsAdmin()
        }
      });
  }

  memberOptions : NbMenuItem[] = [
    {
      title: "Remove Member",
      icon : "person-remove"
    },
    {
    title: "Set as Admin",
      icon: "lock"
    }
  ];

  private setAsAdmin(){
    this.chatService.setChatAdmin(this.chat?.chatId!, this.member?.user?.userId!)
    .subscribe({
      next : _ => {
        this.member!.isAdmin = true;
      },
      error : err => {
        this.errorHandlerService.handleError(err)
      }
    })
  }

  addMember(){
    this.chatService.addChatMember(this.chat?.chatId!, this.user?.userId!)
    .subscribe({
      next: chatMember => {
        this.onMemberAdded.emit(chatMember)
      },
      error : err => {
        this.errorHandlerService.handleError(err)
      }
    })
  }

  loadProfilePicture(){
    return this.type =='member' ? 
            this.userProfileService.loadDisplayPicture(this.member?.user!.displayPictureUrl!, this.member?.user.displayName!)
            : this.userProfileService.loadDisplayPicture(this.user?.displayPictureUrl!, this.user?.displayName!)
  }

}
