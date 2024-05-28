import SignUpDto from '../dtos/auth/SignUpDto';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SigninDto } from '../dtos/auth/signin.dto';
import { AuthenticatedResponseDto } from '../dtos/auth/authenticated-response.dto';
import { response } from 'express';


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
    return this.http.get<boolean>(`${this.API_ENDPOINT}/users/has-duplicate-email/${email}`);
  }

  public isUsernameTaken(username : string) : Observable<boolean>{
    return this.http.get<boolean>(`${this.API_ENDPOINT}/users/has-duplicate-username/${username}`);
  }

  signin(data: SigninDto): Observable<AuthenticatedResponseDto> {
    return this.http.post<AuthenticatedResponseDto>(`${this.API_ENDPOINT}/auth/signin`, data, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }
}
