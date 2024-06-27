import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { MessageDto } from '../dtos/chat/message.dto';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ChatDto } from '../dtos/chat/chat.dto';
import { ChatMemberDto } from '../dtos/chat/chat-member.dto';
import { Message } from 'primeng/api';
import { ChatHubChatlistUpdateDto } from '../dtos/chat/chathub-chatlist-update.dto';
import { UserProfileService } from './user-profile.service';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;
  private token: string | null = null;
  private newMessageReceived = new Subject<MessageDto>();
  private updatedMessage = new Subject<MessageDto>();
  private deleteMessage = new Subject<MessageDto>();
  private deleteChat = new Subject<number>();
  private isUserStartTyping = new Subject<ChatMemberDto>()
  private isUserEndTyping = new Subject<ChatMemberDto>()
  private lastSeenMessage = new Subject<ChatMemberDto>();
  private chatListNewMessage = new Subject<ChatHubChatlistUpdateDto>();
  private chatListDeletedChat = new Subject<ChatHubChatlistUpdateDto>();
  private chatlistRemovedFromChat = new Subject<ChatDto>();
  private contactsUpdated = new Subject<any>();
  private isConnected: boolean = false;
  private onLeaveGroup = new Subject<number>();

  constructor(
    private http: HttpClient,
    private userProfileService : UserProfileService,
  ) {
  }

  private startConnection(): void {
    if (this.isConnected) return;
    
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`https://localhost:5001/chatRoomHub`, {
        accessTokenFactory: () => localStorage.getItem('chatroom-token') || '',
        withCredentials: true
      })
      .build();

    this.hubConnection.on('UserStartsTyping', (chatMember : ChatMemberDto) => {
        this.isUserStartTyping.next(chatMember)
    });

    this.hubConnection.on('UserTypingEnd', (chatMember : ChatMemberDto) => {
        this.isUserEndTyping.next(chatMember)
    });

    this.hubConnection.on('DeleteChat', (chatId : number) => {
      this.deleteChat.next(chatId);
    });

    this.hubConnection.on('DeleteMessage', (message: MessageDto) => {
      this.deleteMessage.next(message);
    });

    this.hubConnection.on('UpdateMessage', (message: MessageDto) => {
      this.updatedMessage.next(message);
    });

    this.hubConnection.on('ReceiveMessage', (message: MessageDto) => {
      this.newMessageReceived.next(message);
    });

    this.hubConnection.on('NewChatCreated', (chat: ChatDto) => {
      this.joinGroup(chat.chatId);
    });

    this.hubConnection.on('NotifyMessageSeen', (chatMember: ChatMemberDto) => {
      this.lastSeenMessage.next(chatMember);
    });

    this.hubConnection.on('ChatlistNewMessage', (data: ChatHubChatlistUpdateDto) => {
      this.chatListNewMessage.next(data);
    });

    this.hubConnection.on('ChatlistDeleteChat', (data: ChatHubChatlistUpdateDto) => {
      this.chatListDeletedChat.next(data);
    });

    this.hubConnection.on('ChatlistRemovedFromChat', (chat: ChatDto) => {
      this.chatlistRemovedFromChat.next(chat);
    });

    this.hubConnection.on('AddedToChat', (chatId) => {
      this.joinGroup(chatId);
    });

    this.hubConnection.on('ContactsUpdated', () => {
      this.contactsUpdated.next(null);
    });

    this.hubConnection.start()
      .then(() => {
        this.isConnected = true;
        console.log('Connection started');
      })
      .catch(err => console.log('Error while starting connection: ', err));
  }

  public joinGroups(): void {
    this.hubConnection.invoke('RegisterUserGroups')
      .then(() => console.log("User registered to groups."))
      .catch(err => console.error('Error while registering user to groups: ', err));
  }

  public joinGroup(chatId: number): void {
    this.hubConnection.invoke('AddToGroup', chatId)
      .then(() => console.log(`Joined group chat-${chatId}`))
      .catch(err => console.error('Error while joining group: ', err));
  }

  public leaveGroup(chatId: number){
    const _subject = new  Subject<any>()
    this.hubConnection.invoke('RemoveFromGroupAsync', chatId)
      .then(() => {
        this.onLeaveGroup.next(chatId)
      })
      .catch(err => console.error('Error while leaving group: ', err));
  }

  public updateConnection(token: string | null): void {
    this.token = token;
  
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.stop().then(() => {
        this.startConnection();
        console.log('Connection restarted with new access token.');
      });
    } else {
      this.startConnection();
      console.log('Connection started with new access token.');
    }
  }

  public stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop().then(() => {
        this.isConnected = false;
        console.log("Connection stopped.");
      });
    }
  }

  public getDeletedChatId(): Observable<number> {
    return this.deleteChat.asObservable();
  }

  public getNewMessageReceived(): Observable<MessageDto> {
    return this.newMessageReceived.asObservable();
  }

  public getLastSeenMessage(): Observable<ChatMemberDto> {
    return this.lastSeenMessage.asObservable();
  }

  public getUpdatedMessage() : Observable<MessageDto> {
    return this.updatedMessage.asObservable();
  }

  public getDeletedMessage() : Observable<MessageDto> {
    return this.deleteMessage.asObservable();
  }

  public getChatListNewMessage() : Observable<ChatHubChatlistUpdateDto> {
    return this.chatListNewMessage.asObservable();
  }

  public getChatlistDeletedChat() : Observable<ChatHubChatlistUpdateDto> {
    return this.chatListDeletedChat.asObservable();
  }

  public getUserTypingStart() : Observable<ChatMemberDto> {
    return this.isUserStartTyping.asObservable();
  }

  public getUserTypingEnd() : Observable<ChatMemberDto> {
    return this.isUserEndTyping.asObservable();
  }

  public getRemovedFromChat() : Observable<ChatDto>{
    return this.chatlistRemovedFromChat.asObservable();
  }

  public getContactsUpdated() : Observable<any>{
    return this.contactsUpdated.asObservable();
  }

  public getOnLeaveGroup() : Observable<number>{
    return this.onLeaveGroup.asObservable();
  }
}
