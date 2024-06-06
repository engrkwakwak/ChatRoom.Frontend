import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { ChatService } from '../../../services/chat.service';
import { AuthService } from '../../../services/auth.service';
import { concat, tap } from 'rxjs';
import { UserDto } from '../../../dtos/chat/user.dto';
import { UserProfileService } from '../../../services/user-profile.service';
import { ErrorHandlerService } from '../../../services/error-handler.service';
import { NbToastrService } from '@nebular/theme';
import { NewChatMessageDto } from '../../../dtos/chat/new-chat-message.dto';
import { ChatDto } from '../../../dtos/chat/chat.dto';
import { MessageForCreationDto } from '../../../dtos/chat/message-for-creation.dto';
import { MessageService } from '../../../services/message.service';
import { MessageListComponent } from '../components/message-list/message-list.component';

@Component({
  selector: 'app-chat-view',
  templateUrl: './chat-view.component.html',
  styleUrl: './chat-view.component.scss'
})
export class ChatViewComponent {
  constructor(
    private activatedRoute : ActivatedRoute,
    private router : Router,
    private chatService : ChatService,
    private authService : AuthService,
    private userProfileService : UserProfileService,
    private errorHandlerService : ErrorHandlerService,
    private messageService : MessageService,
    private toast : NbToastrService
  ){}

  @ViewChild('messageList') messageListComponent! : MessageListComponent
  /* 
    UserId of the current user on the session
  */
  userId: number = 0;
  /* 
    ChatId of Chat usually initialize from the route
  */
  chatId : number | null = null;
  /* 
    Chat info of the conversation
   */
  chat : ChatDto|null = null;
  /* 
    List of members of the chat either a P2P chat or Group chat
  */
  members : UserDto[] = [];
  /* 
   UserId of the receiver for P2P chats
  */
  receiverId : number | null = null;
  /* 
    UserDto instance of the receiver
  */
  receiver : UserDto|null = null;
  /* 
    displayImage of the group chat or the receiver
  */
  profileImageSrc : string|null = null;


  ngOnInit(){
    this.activatedRoute.paramMap.subscribe({
      next: (paramMap) => {
        this.chatId = parseInt(paramMap.get("id")!);
        if(paramMap.has("chatId")){
          this.chatId = parseInt(paramMap.get("chatId")!)
          this.userId = this.userProfileService.getUserIdFromToken();
          this.initChatFromChatlist()
        }
        if(paramMap.has("userId")){
          this.receiverId = parseInt(paramMap.get("userId")!);
          this.initChatFromContacts();
        }
      }
    });
  }

  private initChatFromContacts(){
    this.chatService.getP2PChatIdByUserIds(this.authService.getUserIdFromSession(), this.receiverId!)
    .subscribe({
      next : (res) => {
        if(res){
          this.router.navigate([`/chat/view/from-chatlist/${res}`])
        }
      }
    });
    this.userProfileService.getUser(`/users/${this.receiverId}`)
    .subscribe({
      next: res => {
        this.receiver = res;
        this.profileImageSrc = this.userProfileService.loadDisplayPicture(res.displayPictureUrl!, res.displayName)
      },
      error : err => {
        this.errorHandlerService.handleError(err)
      }
    })
  }

  private initChatFromChatlist(){
    concat(
      this.chatService.getChatByChatId(this.chatId!).pipe(
        tap(chat => this.chat = chat)
      ),
      this.chatService.getMembersByChatId(this.chatId!).pipe(
        tap(res => {
          this.members = res;
          if(this.chat?.chatTypeId == 1){
            this.receiver = this.members.filter(member => {
              return member.userId != this.authService.getUserIdFromSession()
            })[0]
            this.profileImageSrc = this.userProfileService.loadDisplayPicture(this.receiver.displayPictureUrl!, this.receiver.displayName)
          }
          else{
            this.receiver = null;
            this.profileImageSrc = this.userProfileService.loadDisplayPicture(this.chat?.displayPictureUrl!, this.chat?.chatName!)
          }
        })
      )
    ).subscribe();
  }


  public sendMessage(ev : any){
    const message = ev.message;
    if(!this.chatId || this.chatId == 0){
      this.sendMessageForNewChat(message);
    }
    if(this.chatId && this.chatId > 0){
      this.sendMessageForExistingChats(message)
    }
  }

  private sendMessageForNewChat(content : string){
    const message : NewChatMessageDto = {
      Content: content,
      SenderId : this.authService.getUserIdFromSession(),
      ReceiverId : this.receiverId!
    }
    this.chatService.sendMessageForNewChat(message)
    .subscribe({
      next : _ => {
        this.initChatFromContacts()
      },
      error : err => this.errorHandlerService.handleError(err)
    })
  }

  private sendMessageForExistingChats(_message : string){  
    const message : MessageForCreationDto = {
      ChatId : this.chat?.chatId!,
      Content : _message,
      MsgTypeId : 1,
      SenderId : this.authService.getUserIdFromSession()
    }
    this.messageService.sendMessage(message)
    .subscribe({
      next : message => {
        this.messageListComponent.messages.push(message)
      },
      error : err => this.errorHandlerService.handleError(err)
    })
  }

}
