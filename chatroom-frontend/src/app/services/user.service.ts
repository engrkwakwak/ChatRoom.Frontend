import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { UserDto } from '../dtos/chat/user.dto';
// import { UserSearchParameters } from '../dtos/shared/user-search-parameters.dto.ts';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { UserSearchParameters } from '../dtos/shared/user-search-parameters.dto';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private http : HttpClient
  ) { }

  private API_ENDPOINT = environment.apiUrl;  

  public searchUsersByName(parameter : UserSearchParameters) : Observable<UserDto[]> {
    return this.http.get<UserDto[]>(`${this.API_ENDPOINT}/users/search/${parameter.Name}`, { params: {
      Name : parameter.Name,
      PageSize : parameter.PageSize,
      PageNumber : parameter.PageNumber
    }});
  }

  public getUsers(route: string): Observable<HttpResponse<UserDto[]>> {
    const url = `${this.API_ENDPOINT}${route}`;
    return this.http.get<UserDto[]>(url, {observe: "response"});
  }
}
