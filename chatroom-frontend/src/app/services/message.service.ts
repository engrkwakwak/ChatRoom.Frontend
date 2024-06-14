import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { MessageDto } from '../dtos/chat/message.dto';
import { MessageForCreationDto } from '../dtos/chat/message-for-creation.dto';
import { MessageForUpdateDto } from '../dtos/chat/message-for-update.dto';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private API_ENDPOINT = environment.apiUrl

  constructor(
    private httpClient: HttpClient
  ) { }

  public getMessages(route: string) : Observable<HttpResponse<MessageDto[]>> {
    const url = `${this.API_ENDPOINT}${route}`;
    return this.httpClient.get<MessageDto[]>(url, { observe: 'response' });
  }

  public sendMessage(message : MessageForCreationDto) : Observable<MessageDto>{
    return this.httpClient.post<MessageDto>(`${this.API_ENDPOINT}/chats/${message.ChatId}/messages`, message);
  }

  public deleteMessage(messageId : number, chatId : number) : Observable<any>{
    return this.httpClient.delete<any>(`${this.API_ENDPOINT}/chats/${chatId}/messages/${messageId}`);
  }

  public updateMessage(message : MessageForUpdateDto) : Observable<MessageDto>{
    return this.httpClient.put<MessageDto>(`${this.API_ENDPOINT}/chats/${message.ChatId}/messages/${message.MessageId}`, message);
  }
}
