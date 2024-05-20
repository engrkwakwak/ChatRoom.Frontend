import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import SignUpDto from '../dtos/auth/SignUpDto';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http : HttpClient
  ) { }

  private API_ENDPOINT = environment.apiUrl;

  public signup(data : SignUpDto) : Observable<SignUpDto>{
    return this.http.post<SignUpDto>(`${this.API_ENDPOINT}/auth/signup`, data);
  }

  public isEmailTaken(email : string) : Observable<boolean>{
    return this.http.get<boolean>(`${this.API_ENDPOINT}/users/has-duplicate-email`,{
      params: {
        email : email
      }
    });
  }

  public isUsernameTaken(username : string) : Observable<boolean>{
    return this.http.get<boolean>(`${this.API_ENDPOINT}/users/has-duplicate-username`, {
      params: {
        username : username
      },
    });
  }
}
