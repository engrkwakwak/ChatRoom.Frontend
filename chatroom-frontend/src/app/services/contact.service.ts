import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContactForCreationDto } from '../dtos/chat/contact-for-creation.dto';
import { ContactDto } from '../dtos/chat/contact.dto';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  constructor(
    private http : HttpClient
  ) { }

  private API_ENDPOINT = environment.apiUrl;  

  public addContact(parameter : ContactForCreationDto) : Observable<any> {
    return this.http.post<any>(`${this.API_ENDPOINT}/contacts`, parameter);
  }

  public deleteContact(userId : number, contactId : number) : Observable<any> {
    return this.http.delete<any>(`${this.API_ENDPOINT}/contacts/${userId}/${contactId}`);
  }

  public getActiveContactByUserIdContactId(userId : number, contactId : number) : Observable<ContactDto>{
    return this.http.get<ContactDto>(`${this.API_ENDPOINT}/contacts/active/${userId}/${contactId}`);
  }
}
