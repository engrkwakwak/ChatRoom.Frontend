import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { NewChatMessageDto } from '../dtos/chat/new-chat-message.dto';
import { MessageDto } from '../dtos/chat/message.dto';
import { ChatDto } from '../dtos/chat/chat.dto';
import { UserDto } from '../dtos/chat/user.dto';
import { MessageForCreationDto } from '../dtos/chat/message-for-creation.dto';
import { ChatParameters } from '../dtos/shared/chat-parameters.dto';
import { ChatForCreationDto } from '../dtos/chat/chat-for-creation.dto';
import { ChatMemberDto } from '../dtos/chat/chat-member.dto';
import { ChatMemberForUpdateDto } from '../dtos/chat/chat-member-for-update.dto';
import { ChatForUpdateDto } from '../dtos/chat/chat-for-update.dto';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  public isChatlistVisible : boolean = false;
  public isMobile = true;

  onGroupChatLeave : Subject<ChatDto> = new Subject<ChatDto>();
  onMemberRemove : Subject<ChatMemberDto> = new Subject<ChatMemberDto>();

  constructor(
    private http : HttpClient
  ) { }

  private API_ENDPOINT = environment.apiUrl;

  showChatlist(){
    this.isChatlistVisible = true;
  }

  hideChatlist(){
    this.isChatlistVisible = false;
  }

  showChatlistByScreenWidth(width:number){
    if(width > 768){
      this.showChatlist();
      this.isMobile = false;
    }
    else{
      this.hideChatlist();
      this.isMobile = true;
    }
  }

  getP2PChatIdByUserIds(userId1 : number, userId2 : number) : Observable<number|null>{
    return this.http.get<number | null>(`${this.API_ENDPOINT}/chats/get-p2p-chatid-by-userids?userId1=${userId1}&userId2=${userId2}`);
  }

  sendMessageForNewChat(message : NewChatMessageDto) : Observable<MessageDto>{
    return this.http.post<MessageDto>(`${this.API_ENDPOINT}/chats/send-message-to-new-chat`, message);
  }

  getChatByChatId(chatId : number ) : Observable<ChatDto> {
    return this.http.get<ChatDto>(`${this.API_ENDPOINT}/chats/${chatId}`);
  }

  getMembersByChatId(chatId : number) : Observable<ChatMemberDto[]> {
    return this.http.get<ChatMemberDto[]>(`${this.API_ENDPOINT}/chats/${chatId}/members`);
  }

  getMemberByChatIdAndUserId(chatId : number, userId:number) : Observable<ChatMemberDto> {
    return this.http.get<ChatMemberDto>(`${this.API_ENDPOINT}/chats/${chatId}/members/${userId}`);
  }

  createChat(route: string, chat: ChatForCreationDto): Observable<ChatDto> {
    return this.http.post<ChatDto>(`${this.API_ENDPOINT}${route}`, chat);
  }

  updateLastSeenMessage(route: string, chatMember: ChatMemberForUpdateDto) : Observable<any>{
    return this.http.put<any>(`${this.API_ENDPOINT}${route}`, chatMember);
  }

  deleteChatByChatId(chatId : number) : Observable<any> {
    return this.http.delete<any>(`${this.API_ENDPOINT}/chats/${chatId}`);
  }

  canViewChat(chatId : number) : Observable<boolean> {
    return this.http.get<boolean>(`${this.API_ENDPOINT}/chats/${chatId}/can-view`);
  }

  getChatListByUserId(chatParameters : ChatParameters) : Observable<ChatDto[]> {
    return this.http.get<ChatDto[]>(`${this.API_ENDPOINT}/chats/get-by-user-id`, {
      params: {
        PageSize : chatParameters.PageSize,
        PageNumber : chatParameters.PageNumber,
        UserId : chatParameters.UserId,
        Name : chatParameters.Name
      }
    });
  }

  addChatMember(chatId : number, memberUserId : number) : Observable<ChatMemberDto> {
    return this.http.post<ChatMemberDto>(`${this.API_ENDPOINT}/chats/${chatId}/add-member/${memberUserId}`, {});
  }

  setChatAdmin(chatId : number, memberUserId : number) : Observable<any> {
    return this.http.post<any>(`${this.API_ENDPOINT}/chats/${chatId}/set-admin/${memberUserId}`, {});
  }

  removeAdminRole(chatId : number, memberUserId : number) : Observable<any> {
    return this.http.post<any>(`${this.API_ENDPOINT}/chats/${chatId}/remove-admin/${memberUserId}`, {});
  }

  removeChatMember(chatId : number, memberUserId : number) : Observable<any> {
    return this.http.delete<any>(`${this.API_ENDPOINT}/chats/${chatId}/remove-member/${memberUserId}`, {});
  }

  leaveChat(chatId : number) : Observable<any> {
    return this.http.put<any>(`${this.API_ENDPOINT}/chats/${chatId}/leave`, {});
  }

  broadcastTypingStatus(chatId : number) :  Observable<null>{
    return this.http.get<null>(`${this.API_ENDPOINT}/chats/${chatId}/typing`);
  }

  updateChat(route: string, chat: ChatForUpdateDto): Observable<void> {
    return this.http.put<void>(`${this.API_ENDPOINT}${route}`, chat);
  }
}
