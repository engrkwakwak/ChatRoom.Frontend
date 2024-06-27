import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserProfileService } from '../../../../services/user-profile.service';
import { ChatService } from '../../../../services/chat.service';
import { ChatParameters } from '../../../../dtos/shared/chat-parameters.dto';
import { ChatDto } from '../../../../dtos/chat/chat.dto';
import { ErrorHandlerService } from '../../../../services/error-handler.service';
import { SignalRService } from '../../../../services/signal-r.service';
import { ChatHubChatlistUpdateDto } from '../../../../dtos/chat/chathub-chatlist-update.dto';
import { NbDialogService } from '@nebular/theme';
import { CreateGroupChatModalComponent } from '../create-group-chat-modal/create-group-chat-modal.component';
import { ChatForCreationDto } from '../../../../dtos/chat/chat-for-creation.dto';
import { AddMembersDialogContext } from '../../../../dtos/chat/add-members-dialog-context';
import { AddMembersModalComponent } from '../add-members-modal/add-members-modal.component';
import { Observable, Subject, Subscriber, Subscription, debounce, debounceTime, distinctUntilChanged, take } from 'rxjs';

@Component({
  selector: 'app-chatlist',
  templateUrl: './chatlist.component.html',
  styleUrl: './chatlist.component.scss'
})
export class ChatlistComponent {
  private subscriptions: Subscription[] = [];

  constructor(
    private router : Router,
    private userProfileSerview : UserProfileService,
    private chatService : ChatService,
    private errorHandlerService : ErrorHandlerService,
    private signalRService : SignalRService,
    private dialogService: NbDialogService
  ){}

  chats : ChatDto[] = [];
  fetchingChats : boolean = false;
  searchInput = new Subject<string>();
  chatlistUpdated : boolean = false;
  chatParams : ChatParameters = {
    PageSize : 10,
    PageNumber : 1,
    UserId : 0,
    Name : ""
  }

  hideChatlist(){
    this.chatService.hideChatlist()
  }

  viewChat(chat:ChatDto){
    if(this.chatService.isMobile){
      this.hideChatlist();
    }
    this.router.navigate([`/chat/view/from-chatlist/${chat.chatId}`], {
      replaceUrl: true
    });
  }

  fetchChats(){
    if(this.fetchingChats || this.chatlistUpdated){
      this.chatlistUpdated = false;
      return;
    }
    this.fetchingChats = true;
    this.chatService.getChatListByUserId(this.chatParams)
    .pipe(take(1))
    .subscribe({
      next : (chats : ChatDto[]) => {
        if(chats.length > 0){
          this.chats.push(...chats)
          this.chatParams.PageNumber++;
        }
      },
      error : err => this.errorHandlerService.handleError(err),
      complete: () => this.fetchingChats = false
    })
  }

  onSearchInput(ev : any){
    this.searchInput.next(ev.target.value.trimEnd())
  }

  // searchListener() : Observable<string>{
  //   return this.searchInput.as
  // }

  private resetParams(){
    this.chats = [];
    this.chatParams.PageNumber = 1
  }

  ngOnDestroy(){
    this.subscriptions.forEach(subscriber => {
      subscriber.unsubscribe();
    });
  }

  
  ngOnInit(){
    this.chatParams.UserId = this.userProfileSerview.getUserIdFromToken();

    let _sub : Subscription = this.signalRService.getChatListNewMessage().subscribe((data : ChatHubChatlistUpdateDto) => {
      this.chatlistUpdated = true;
      this.chats.forEach((_chat : ChatDto, i:number) => {
        if(_chat.chatId == data.chat.chatId) {
          this.chats.splice(i,1);
        }
      });
      this.chats.unshift(data.chat);
    });
    this.subscriptions.push(_sub);

    this.signalRService.getChatlistDeletedChat().subscribe((data : ChatHubChatlistUpdateDto) => {
      this.signalRService.leaveGroup(data.chat.chatId);
    });

    this.signalRService.getOnLeaveGroup().subscribe(chatId => {
      this.removeFromChats(chatId);
    });

    this.signalRService.getRemovedFromChat().subscribe((chat :ChatDto) => {
      this.removeFromChats(chat.chatId);
      if(`/chat/view/from-chatlist/${chat.chatId}`){
        this.router.navigate(["/chat"]);
      }
      this.signalRService.leaveGroup(chat.chatId);
    });

    this.searchInput
    .pipe(
      debounceTime(300),
      distinctUntilChanged()
    )
    .subscribe(keyword => {
      this.chatParams.Name = keyword;
      this.resetParams();
      this.fetchChats();
    })

  }

  removeFromChats(chatId : number){
    this.chatlistUpdated = true
    this.chats.forEach((_chat:ChatDto, i) =>{
      if(chatId == _chat.chatId){
        this.chats.splice(i,1);
        console.log("remove from chatlist")
      }
    });
  }

  openCreateGCFirstModal(){
    this.dialogService.open(CreateGroupChatModalComponent)
      .onClose.subscribe(groupChatData => {
        if(groupChatData) {
          this.openCreateGCSecondModal(groupChatData);
        }
      });
  }

  openCreateGCSecondModal(chat: ChatForCreationDto) {
    const context: AddMembersDialogContext = { chat };
    this.dialogService.open(AddMembersModalComponent, { context })
      .onClose.subscribe(updatedGroupChatData => {
        if(updatedGroupChatData) {
          this.createGroupChat(updatedGroupChatData);
        }
      });
  }

  createGroupChat(chat: ChatForCreationDto) {
    const uri: string = `/chats`
    this.chatService.createChat(uri, chat).subscribe({
      next: (createdChat) => {
        this.router.navigate([`/chat/view/from-chatlist/${createdChat.chatId}`]);
      },
      error: (err) => {
        this.errorHandlerService.handleError(err);
      }
    });
  }
}
