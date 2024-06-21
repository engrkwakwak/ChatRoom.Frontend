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

@Component({
  selector: 'app-chatlist',
  templateUrl: './chatlist.component.html',
  styleUrl: './chatlist.component.scss'
})
export class ChatlistComponent {
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
    if(this.fetchingChats){
      return;
    }
    this.fetchingChats = true;
    this.chatService.getChatListByUserId(this.chatParams)
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

  search(ev : any){
    this.chatParams.Name = ev.target.value.trimEnd();
    this.resetParams();
    this.fetchChats();
  }

  resetParams(){
    this.chats = [];
    this.chatParams.PageNumber = 1
  }

  ngOnInit(){
    this.chatParams.UserId = this.userProfileSerview.getUserIdFromToken();

    this.signalRService.getChatListNewMessage().subscribe((data : ChatHubChatlistUpdateDto) => {
      this.chats.forEach((_chat : ChatDto, i:number) => {
        if(_chat.chatId == data.chat.chatId) {
          this.chats.splice(i,1);
        }
      })
      this.chats.unshift(data.chat)
    });

    this.signalRService.getChatlistDeletedChat().subscribe((data : ChatHubChatlistUpdateDto) => {
      this.chats.forEach((_chat : ChatDto, i:number) => {
        if(_chat.chatId == data.chat.chatId){
          this.chats.splice(i,1);
        }
      })
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
