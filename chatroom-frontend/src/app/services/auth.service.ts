import SignUpDto from '../dtos/auth/signup.dto';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SigninDto } from '../dtos/auth/signin.dto';
import { AuthenticatedResponseDto } from '../dtos/auth/authenticated-response.dto';
import { response } from 'express';
import { JWT_OPTIONS, JwtHelperService } from '@auth0/angular-jwt';



export interface JwtToken {
  sub : string,
  iss : string,
  exp : number,
  aud : string
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http : HttpClient,
    private jwtHelper : JwtHelperService
  ) { }

  private API_ENDPOINT = environment.apiUrl;

  public decodeAuthToken() : JwtToken{
    var token : string  = localStorage.getItem("chatroom-token")!;
    var decodedToken : JwtToken = this.jwtHelper.decodeToken(token)!;
    return decodedToken;
  }

  public signup(data : SignUpDto) : Observable<SignUpDto>{
    return this.http.post<SignUpDto>(`${this.API_ENDPOINT}/auth/signup`, data);
  }

  public isEmailTaken(email : string) : Observable<boolean>{
    return this.http.get<boolean>(`${this.API_ENDPOINT}/users/has-duplicate-email/${email}`);
  }

  public isUsernameTaken(username : string) : Observable<boolean>{
    return this.http.get<boolean>(`${this.API_ENDPOINT}/users/has-duplicate-username/${username}`);
  }

  public signin(data: SigninDto): Observable<AuthenticatedResponseDto> {
    return this.http.post<AuthenticatedResponseDto>(`${this.API_ENDPOINT}/auth/signin`, data, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  public isEmailVerified(id : number): Observable<any> {
    return this.http.get<boolean>(`${this.API_ENDPOINT}/auth/is-email-verified?id=${id}`, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }

  public sendEmailVerification(id : number): Observable<any> {
    return this.http.post<any>(`${this.API_ENDPOINT}/auth/send-email-verification?id=${id}`, {}, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }


}
