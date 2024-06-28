import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription, concat, debounceTime, distinctUntilChanged, pipe, tap } from 'rxjs';
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
export class ChatViewComponent implements OnInit, OnDestroy {
  @ViewChild('messageList') messageListComponent!: MessageListComponent;
  private subscriptions: Subscription = new Subscription();

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
  someoneIsTyping : boolean = false;
  typingUser : string = "";
  private typingStart : boolean = false;
  private typingWatcher : Subject<string> = new Subject<string>()

  constructor(
    private activatedRoute: ActivatedRoute,
    private chatService: ChatService,
    private authService: AuthService,
    private userProfileService: UserProfileService,
    private errorHandlerService: ErrorHandlerService,
    private messageService: MessageService,
    private signalRService: SignalRService,
    private router : Router,
    private toastrService: NbToastrService
  ) {}

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  initializeMessageListComponent(): void {
    if(!this.messageListComponent || this.messageListComponent.messages.length <= 0){
      return;
    }

    const message = this.messageListComponent.messages[this.messageListComponent.messages.length-1];
    if(message) {
      this.onMessageListUpdated(message);
      this.initializeReadReceipts();
    }
  }

  ngOnInit() {
    this.subscriptions.add(this.activatedRoute.paramMap.subscribe({
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
    }));


    // debug this
    this.subscriptions.add(this.signalRService.getNewMessageReceived().subscribe((message: MessageDto) => {
      if(message.messageType.msgTypeId == 2 && this.userId == message.sender.userId){
        this.messageListComponent.pushMessage(message);
      }
      if(message.chatId === this.chat?.chatId && this.userId != message.sender.userId) {
        this.messageListComponent.pushMessage(message);
      }
    }));

    this.subscriptions.add(this.signalRService.getLastSeenMessage().subscribe((chatMember: ChatMemberDto) => {
      if(chatMember.chatId === this.chat?.chatId) {
        const member = this.members.find(member => member.user.userId == chatMember.user.userId);
        if(member){
          this.reAssignSeenMessage(member, chatMember);
          member.lastSeenMessageId = chatMember.lastSeenMessageId;
        }
      }
    }));

    this.subscriptions.add(this.signalRService.getUpdatedMessage().subscribe((message:MessageDto) => {
      if(message.chatId === this.chat?.chatId && this.userId != message.sender.userId){
        this.messageListComponent.messages.forEach((_message : MessageDto, i:number) => {
          if(_message.messageId == message.messageId){
            this.messageListComponent.messages[i].content = message.content
          }
        });
      }
    }));

    this.subscriptions.add(this.signalRService.getDeletedMessage().subscribe((message:MessageDto) => {
      if(message.chatId === this.chat?.chatId && this.userId != message.sender.userId){
        this.messageListComponent.messages.forEach((_message : MessageDto, i:number) => {
          if(_message.messageId == message.messageId){
            this.messageListComponent.messages.splice(i,1);
          }
        });
      }
    }));

    this.subscriptions.add(this.signalRService.getDeletedChatId().subscribe((chatId:number) => {
      if(chatId === this.chat?.chatId){
        this.router.navigate(["/chat"]);
      }
    }));

    this.subscriptions.add(this.chatService.onMemberRemove.subscribe((chatMember : ChatMemberDto) => {
      this.members.forEach((_member:ChatMemberDto, i) => {
        if(_member.user.userId == chatMember.user.userId && chatMember.chatId == _member.chatId){
          this.members.splice(i, 1);
        }
      });
    }));

    this.subscriptions.add(
      this.signalRService.getUserTypingStart()
      .subscribe((member) => {
        if(member.user.userId != this.userId && member.chatId == this.chatId){
          this.typingUser = member.user.displayName;
          this.someoneIsTyping = true;
        }
      })
    );

    this.subscriptions.add(
      this.signalRService.getUserTypingEnd()
      .subscribe((member) => {
        if(member.user.userId != this.userId){
          this.typingUser = "";
          this.someoneIsTyping = false;
        }
      })
    );

    this.subscriptions.add(
      this.signalRService.getUpdatedChat().subscribe((chat) => {
        if(this.chat?.chatId == chat.chatId) {
          this.chat.chatName = chat.chatName;
          this.chat.displayPictureUrl = chat.displayPictureUrl;
          this.profileImageSrc = chat.displayPictureUrl || null;
        }
      })
    );

    this.typingWatcher
    .pipe(
      debounceTime(300),
      distinctUntilChanged()
    )
    .subscribe(() => {
      this.typingStart = false;
      this.chatService.broadcastTypingStatusEnd(this.chatId).subscribe()
    })
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
        this.initializeMessageListComponent();
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
    if (ev.message.length > 500) {
      this.toastrService.danger('Message must be 500 characters or less.', 'Error is encountered.' );
      return;
    }

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
    const currentLastSeenMessageId: number = sender?.lastSeenMessageId ?? 0;

    if(currentLastSeenMessageId >= message.messageId || sender?.chatId != message.chatId){
      return;
    }

    this.executeLastSeenMessageUpdate(sender, message);
  }

  executeLastSeenMessageUpdate(sender: ChatMemberDto, message: MessageDto): void {
    const chatMember: ChatMemberForUpdateDto = {
      isAdmin: sender!.isAdmin,
      lastSeenMessageId: message.messageId,
      statusId: Status.Active
    };

    const route = `/chats/${this.chat!.chatId}/members/${sender!.user.userId}/last-seen-message`;
    this.chatService.updateLastSeenMessage(route, chatMember).subscribe({
      next: (_) => {
        
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
      if (index >= 0){
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
      const userExists = message.lastSeenUsers.some(user => user.userId === chatMember.user.userId);
      if (!userExists) {
        message.lastSeenUsers.push(chatMember.user);
      }
    }
  }

  chatformInputChange(ev:any){
    if(!this.typingStart){
      this.chatService.broadcastTypingStatusStart(this.chatId).subscribe()
    }
    this.typingStart = true;
    this.typingWatcher.next(ev)
  }

}