import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContactForCreationDto } from '../dtos/chat/contact-for-creation.dto';

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
}
