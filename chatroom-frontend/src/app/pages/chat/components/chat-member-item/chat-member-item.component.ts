import { Component, ErrorHandler, EventEmitter, Input, Output, ViewChild, input } from '@angular/core';
import { ChatMemberDto } from '../../../../dtos/chat/chat-member.dto';
import { UserProfileService } from '../../../../services/user-profile.service';
import { Menu } from 'primeng/menu';
import { NbMenuItem, NbMenuService } from '@nebular/theme';
import { filter, map, take } from 'rxjs';
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
  loading : boolean = false;
  userMembership? : ChatMemberDto;

  ngOnInit(): void {
    this.userId = this.userProfileService.getUserIdFromToken()
    this.nbMenuService.onItemClick()
    .pipe(
      filter(({ tag  }) => tag === `member-actions-menu-${this.member?.user.userId}-${this.chat?.chatId}`),
      map(({ item: { title } }) => title),
    )
    .subscribe(title => {
      if(title === 'Remove Member'){
        this.RemoveMember()
      }
      if(title === 'Set as Admin'){
        this.setAsAdmin()
      }
      if(title === 'Remove as Admin'){
        console.log("remove as admin")
        this.removeAsAdmin()
      }
    });

    // optimize later
    this.chatService.getMemberByChatIdAndUserId(this.chat!.chatId, this.userId)
    .subscribe({
      next : chatMember => {
        this.userMembership = chatMember;
      },
      error : err => {
        this.errorHandlerService.handleError(err);
      }
    });

    this.setMemberOptions();
  }

  memberOptions : NbMenuItem[] = [];

  removeAsAdmin(){
    this.loading = true;
    this.chatService.removeAdminRole(this.chat!.chatId, this.member!.user.userId)
    .subscribe({
      next : _ => {
        this.loading = false;
        this.member!.isAdmin = true;
        this.memberOptions.forEach((opt, i) => {
          if(opt.title == 'Remove as Admin'){
            this.memberOptions[i].title = "Set as Admin"
          }
        });
      },
      error : err => {
        this.loading = false;
        this.errorHandlerService.handleError(err)
      }
    });
  }

  setMemberOptions(){
    this.memberOptions.push( {
      title: "Remove Member",
      icon : "person-remove"
    });
    if(this.member?.isAdmin){
      this.memberOptions.push({
        title: "Remove as Admin",
        icon: "lock"
      });
    }
    else{
      this.memberOptions.push({
        title: "Set as Admin",
        icon: "lock"
      });
    }
    
  }

  private setAsAdmin(){
    this.loading = true;
    this.chatService.setChatAdmin(this.chat?.chatId!, this.member?.user?.userId!)
    .subscribe({
      next : _ => {
        this.loading = false;
        this.member!.isAdmin = true;
        this.memberOptions.forEach((opt, i) => {
          if(opt.title == 'Set as Admin'){
            this.memberOptions[i].title = "Remove as Admin"
          }
        });
      },
      error : err => {
        this.loading = false;
        this.errorHandlerService.handleError(err)
      }
    })
  }

  private RemoveMember(){
    this.loading = true;
    this.chatService.removeChatMember(this.chat?.chatId!, this.member?.user?.userId!)
    // .pipe(
    //   take(1)
    // )
    .subscribe({
      next : _ => {
        this.loading = false;
        this.chatService.onMemberRemove.next(this.member!);
      },
      error : err => {
        this.loading = false;
        this.errorHandlerService.handleError(err)
      }
    });
  }

  addMember(){
    this.loading = true;
    this.chatService.addChatMember(this.chat?.chatId!, this.user?.userId!)
    .subscribe({
      next: chatMember => {
        this.loading = false;
        this.onMemberAdded.emit(chatMember)
      },
      error : err => {
        this.loading = false;
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
