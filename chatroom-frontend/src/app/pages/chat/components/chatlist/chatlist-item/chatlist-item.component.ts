import { Component, Input } from '@angular/core';
import { ChatDto } from '../../../../../dtos/chat/chat.dto';
import { UserDto } from '../../../../../dtos/chat/user.dto';
import { ChatService } from '../../../../../services/chat.service';
import { UserProfileService } from '../../../../../services/user-profile.service';
import { MessageDto } from '../../../../../dtos/chat/message.dto';
import { MessageService } from '../../../../../services/message.service';
import { ErrorHandlerService } from '../../../../../services/error-handler.service';
import { ChatMemberDto } from '../../../../../dtos/chat/chat-member.dto';
import { UserDisplayDto } from '../../../../../dtos/chat/user-display.dto';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatType } from '../../../../../shared/enums';

@Component({
  selector: 'app-chatlist-item',
  templateUrl: './chatlist-item.component.html',
  styleUrl: './chatlist-item.component.scss'
})

export class ChatlistItemComponent {

  constructor(
    private chatService : ChatService,
    private userProfileService : UserProfileService,
    private messageService : MessageService,
    private errorHandlerService : ErrorHandlerService,
    private route : ActivatedRoute,
    private router : Router
  ){}

  @Input({required: true}) chat? : ChatDto;

  receiver? : UserDisplayDto|null;
  latestMessage? : MessageDto;

  getP2PReceiver(){
    this.chatService.getMembersByChatId(this.chat?.chatId!)
    .subscribe({
      next :(members : ChatMemberDto[]) => {
        const userID : number = this.userProfileService.getUserIdFromToken();
        this.receiver = members.filter(member => {
          return member.user.userId != userID;
        })[0].user
      }
    })
  }

  loadProfilePicture(){
    if(this.chat?.chatTypeId == 1){
      return this.userProfileService.loadDisplayPicture(this.receiver?.displayPictureUrl!, this.receiver?.displayName!)
    }
    return this.userProfileService.loadDisplayPicture(this.chat?.displayPictureUrl!, this.chat?.chatName!)
  }

  ngOnInit(){
    if(this.chat?.chatTypeId === ChatType.P2P) {
      this.getP2PReceiver();
    }
    
    this.messageService.getLatestMessage(this.chat?.chatId!)
    .subscribe({
      next : message => this.latestMessage = message,
      error : err => this.errorHandlerService.handleError(err)
    })
  }
}
