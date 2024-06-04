import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { MessageDto } from '../dtos/chat/message.dto';

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
}
