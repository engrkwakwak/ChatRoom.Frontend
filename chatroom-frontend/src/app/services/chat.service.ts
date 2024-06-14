import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NewChatMessageDto } from '../dtos/chat/new-chat-message.dto';
import { MessageDto } from '../dtos/chat/message.dto';
import { ChatDto } from '../dtos/chat/chat.dto';
import { UserDto } from '../dtos/chat/user.dto';
import { MessageForCreationDto } from '../dtos/chat/message-for-creation.dto';
import { ChatForCreationDto } from '../dtos/chat/chat-for-creation.dto';
import { ChatMemberDto } from '../dtos/chat/chat-member.dto';
import { ChatMemberForUpdateDto } from '../dtos/chat/chat-member-for-update.dto';

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

  getMembersByChatId(chatId : number) : Observable<ChatMemberDto[]> {
    return this.http.get<ChatMemberDto[]>(`${this.API_ENDPOINT}/chats/${chatId}/members`);
  }

  createChat(route: string, chat: ChatForCreationDto): Observable<ChatDto> {
    return this.http.post<ChatDto>(`${this.API_ENDPOINT}${route}`, chat);
  }

  updateLastSeenMessage(route: string, chatMember: ChatMemberForUpdateDto) : Observable<any>{
    return this.http.put<any>(`${this.API_ENDPOINT}${route}`, chatMember);
  }
}
