import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NewChatMessageDto } from '../dtos/chat/new-chat-message.dto';
import { MessageDto } from '../dtos/chat/message.dto';
import { ChatDto } from '../dtos/chat/chat.dto';
import { UserDto } from '../dtos/chat/user.dto';
import { MessageForCreationDto } from '../dtos/chat/message-for-creation.dto';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(
    private http : HttpClient
  ) { }

  private API_ENDPOINT = environment.apiUrl;

  getP2PChatIdByUserIds(userId1 : number, userId2 : number) : Observable<number|null>{
    return this.http.get<number | null>(`${this.API_ENDPOINT}/chats/get-p2p-chatid-by-userids?userId1=${userId1}&userId2=${userId2}`);
  }

  sendMessageForNewChat(message : NewChatMessageDto) : Observable<MessageDto>{
    return this.http.post<MessageDto>(`${this.API_ENDPOINT}/chats/send-message-to-new-chat`, message);
  }

  getChatByChatId(chatId : number ) : Observable<ChatDto> {
    return this.http.get<ChatDto>(`${this.API_ENDPOINT}/chats/${chatId}`);
  }

  getMembersByChatId(chatId : number) : Observable<UserDto[]> {
    return this.http.get<UserDto[]>(`${this.API_ENDPOINT}/chats/${chatId}/members`);
  }

  deleteChatByChatId(chatId : number) : Observable<any> {
    return this.http.delete<any>(`${this.API_ENDPOINT}/chats/${chatId}`);
  }

  canViewChat(chatId : number) : Observable<boolean> {
    return this.http.get<boolean>(`${this.API_ENDPOINT}/chats/${chatId}/can-view`);
  }
}
