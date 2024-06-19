import SignUpDto from '../dtos/auth/signup.dto';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SigninDto } from '../dtos/auth/signin.dto';
import { AuthenticatedResponseDto } from '../dtos/auth/authenticated-response.dto';
import { response } from 'express';
import { JWT_OPTIONS, JwtHelperService } from '@auth0/angular-jwt';
import { jwtDecode } from 'jwt-decode';
import { UpdatePasswordDto } from '../dtos/auth/update-password.dto';
import { SignalRService } from './signal-r.service';
import { Router } from '@angular/router';



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
    private jwtHelper : JwtHelperService,
    private signalRService : SignalRService,
    private router : Router
  ) { }

  private API_ENDPOINT = environment.apiUrl;

  public getUserIdFromSession() : number{
    var userId: number = 0;
    const token = localStorage.getItem('chatroom-token');
    if(token){
      const decodedToken = jwtDecode<any>(token);
      userId = decodedToken['sub'];
    }
    return userId;
  }

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

  public sendPasswordResetLink(id : number): Observable<any> {
    return this.http.post<any>(`${this.API_ENDPOINT}/auth/send-password-reset-link?userId=${id}`, {});
  }

  public sendPasswordResetLinkByEmail(email : string): Observable<any> {
    return this.http.post<any>(`${this.API_ENDPOINT}/auth/send-password-reset-link-via-email?email=${email}`, {});
  }

  public updatePassword(updatePasswordDto : UpdatePasswordDto): Observable<any> {
    return this.http.put<any>(`${this.API_ENDPOINT}/auth/update-password`, updatePasswordDto);
  }

  public logout(){
    this.signalRService.stopConnection();
    localStorage.removeItem("chatroom-token");
    this.router.navigate(['/signin']);
  }

}
