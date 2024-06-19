import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, concat, tap } from 'rxjs';
import { ChatService } from '../../../services/chat.service';
import { AuthService } from '../../../services/auth.service';
import { UserProfileService } from '../../../services/user-profile.service';
import { ErrorHandlerService } from '../../../services/error-handler.service';
import { NbToastrService } from '@nebular/theme';
import { MessageService } from '../../../services/message.service';
import { MessageListComponent } from '../components/message-list/message-list.component';
import { ChatDto } from '../../../dtos/chat/chat.dto';
import { ChatForCreationDto } from '../../../dtos/chat/chat-for-creation.dto';
import { UserDto } from '../../../dtos/chat/user.dto';
import { MessageForCreationDto } from '../../../dtos/chat/message-for-creation.dto';
import { ChatType, MessageType, Status } from '../../../shared/enums';
import { SignalRService } from '../../../services/signal-r.service';
import { MessageDto } from '../../../dtos/chat/message.dto';
import { ChatMemberDto } from '../../../dtos/chat/chat-member.dto';
import { ChatMemberForUpdateDto } from '../../../dtos/chat/chat-member-for-update.dto';

@Component({
  selector: 'app-chat-view',
  templateUrl: './chat-view.component.html',
  styleUrls: ['./chat-view.component.scss']
})
export class ChatViewComponent implements OnInit {
  @ViewChild('messageList') messageListComponent!: MessageListComponent;

  userId: number = 0;
  chatId: number = 0;
  receiverId: number = 0;
  receiverName: string = "";
  chat: ChatDto | null = null;
  members: ChatMemberDto[] = [];
  profileImageSrc: string | null = null;
  routeSub: Subscription | null = null;
  navigationSub!: Subscription;
  isInitialized: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private chatService: ChatService,
    private authService: AuthService,
    private userProfileService: UserProfileService,
    private errorHandlerService: ErrorHandlerService,
    private messageService: MessageService,
    private signalRService: SignalRService,
    private router : Router
  ) {}

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe({
      next: (paramMap) => {
        this.userId = this.userProfileService.getUserIdFromToken();
        if(paramMap.has("chatId")){
          this.chatId = parseInt(paramMap.get("chatId")!)
          this.initChatFromChatlist()
        } else if(paramMap.has("userId")){
          this.receiverId = parseInt(paramMap.get("userId")!);
          this.initChatFromContacts();
        }
      }
    });
    this.signalRService.getNewMessageReceived().subscribe((message: MessageDto) => {
      if(message.chatId === this.chat?.chatId && this.userId != message.sender.userId) {
        const isDuplicate = this.messageListComponent.messages.some(existingMessage => existingMessage.messageId === message.messageId);
        if(!isDuplicate){
          this.messageListComponent.pushMessage(message);
        }
      }
    });
    this.signalRService.getLastSeenMessage().subscribe((chatMember: ChatMemberDto) => {
      if(chatMember.chatId === this.chat?.chatId) {
        let member = this.members.find(member => member.user.userId == chatMember.user.userId);
        if(member){
          this.reAssignSeenMessage(member, chatMember);
          member = chatMember;
        }

        console.log(`Last seen message of user ${chatMember.user.displayName} is updated to ${chatMember.lastSeenMessageId}`);
      }
    });

    this.signalRService.getUpdatedMessage().subscribe((message:MessageDto) => {
      if(message.chatId === this.chat?.chatId && this.userId != message.sender.userId){
        this.messageListComponent.messages.forEach((_message : MessageDto, i:number) => {
          if(_message.messageId == message.messageId){
            this.messageListComponent.messages[i].content = message.content
          }
        });
      }
    });

    this.signalRService.getDeletedMessage().subscribe((message:MessageDto) => {
      if(message.chatId === this.chat?.chatId && this.userId != message.sender.userId){
        this.messageListComponent.messages.forEach((_message : MessageDto, i:number) => {
          if(_message.messageId == message.messageId){
            this.messageListComponent.messages.splice(i,1);
          }
        });
      }
    });

    this.signalRService.getDeletedChatId().subscribe((chatId:number) => {
      if(chatId === this.chat?.chatId){
        this.router.navigate(["/chat"]);
      }
    });
  }

  private initChatFromContacts() {
    const chat: ChatForCreationDto = {
      chatTypeId: ChatType.P2P,
      statusId: Status.Active,
      chatMemberIds: [this.authService.getUserIdFromSession(), this.receiverId!]
    };
    const route: string = `/chats`;
    this.chatService.createChat(route, chat).subscribe({
      next: res => {
        this.chat = res;
        this.chatId = res.chatId;
        this.loadChatMembers(this.chat.chatId);
        this.isInitialized = true;
      },
      error: err => this.errorHandlerService.handleError(err)
    });
  }

  private initChatFromChatlist() {
    this.chatService.getChatByChatId(this.chatId!)
    .subscribe((chat :ChatDto) =>{
        this.chat = chat;
        this.loadChatMembers(this.chat.chatId);
        this.isInitialized = true;
    });
  }

  private loadChatMembers(chatId: number) {
    this.chatService.getMembersByChatId(chatId).subscribe({
      next: members => {
        this.members = members;
        this.updateReceiverAndProfileImage();
      },
      error: err => this.errorHandlerService.handleError(err)
    });
  }

  private updateReceiverAndProfileImage() {
    if (this.chat?.chatTypeId === ChatType.P2P) {
      const receiver = this.members.find(member => member.user.userId !== this.userId);
      this.profileImageSrc = this.userProfileService.loadDisplayPicture(receiver!.user.displayPictureUrl!, receiver!.user.displayName);
      this.receiverName = receiver?.user.displayName!;
    } else {
      this.profileImageSrc = this.userProfileService.loadDisplayPicture(this.chat?.displayPictureUrl!, this.chat?.chatName!);
    }
  }

  public sendMessage(ev: any) {
    const message: MessageForCreationDto = {
      ChatId: this.chat?.chatId!,
      Content: ev.message,
      MsgTypeId: MessageType.Normal,
      SenderId: this.authService.getUserIdFromSession()
    };
    this.messageService.sendMessage(message).subscribe({
      next: message => {
        this.messageListComponent.pushMessage(message);
      },
      error: err => this.errorHandlerService.handleError(err)
    });
  }

  onMessageListUpdated(message: MessageDto) {
    const sender = this.members.find(member => member.user.userId == this.userId);

    if(sender!.lastSeenMessageId >= message.messageId){
      return;
    }

    const chatMember: ChatMemberForUpdateDto = {
      isAdmin: sender!.isAdmin,
      lastSeenMessageId: message.messageId,
      statusId: Status.Active
    };

    const route = `/chats/${this.chat!.chatId}/members/${sender!.user.userId}/last-seen-message`;
    this.chatService.updateLastSeenMessage(route, chatMember).subscribe({
      next: (_) => {
        console.log(`Last seen successfully updated. ChatId: ${this.chat?.chatId}. userId: ${sender?.user.userId}`);
      },
      error: (err) => this.errorHandlerService.handleError(err) 
    });
  }

  initializeReadReceipts(){
    if(this.members){
      this.members.forEach(member => {
        this.assignSeenMessage(member);
      });
    }
  }

  reAssignSeenMessage(currentChatMember: ChatMemberDto, newChatMember: ChatMemberDto) {
    const currentMessageAssignment = this.messageListComponent.messages.find(msg => msg.messageId === currentChatMember.lastSeenMessageId);
    if(currentMessageAssignment){
      const index = currentMessageAssignment.lastSeenUsers.findIndex(user => user.userId === currentChatMember.user.userId);
      if (index >= 1){
        currentMessageAssignment.lastSeenUsers.splice(index, 1);
      }
    }

    const message = this.messageListComponent.messages.find(message => message.messageId === newChatMember.lastSeenMessageId);
    if(message){
      message.lastSeenUsers.push(newChatMember.user);
    }
  }

  assignSeenMessage(chatMember: ChatMemberDto) {
    const message = this.messageListComponent.messages.find(message => message.messageId === chatMember.lastSeenMessageId);
    if(message){
      message.lastSeenUsers.push(chatMember.user);
    }
  }

  chatformInputChange(){
    this.chatService.broadcastTypingStatus(this.chatId).subscribe();
  }
}