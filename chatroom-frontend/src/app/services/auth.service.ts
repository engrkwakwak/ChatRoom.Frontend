import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SigninDto } from '../dtos/auth/signin.dto';
import { AuthenticatedResponseDto } from '../dtos/auth/authenticated-response.dto';
import { Observable } from 'rxjs';
import { response } from 'express';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API_ENDPOINT = environment.apiUrl;
  constructor(
    private http: HttpClient
  ) { }

  signin(data: SigninDto): Observable<AuthenticatedResponseDto> {
    return this.http.post<AuthenticatedResponseDto>(`${this.API_ENDPOINT}/auth/signin`, data, {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      })
    });
  }
}
