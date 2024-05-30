import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { UserForUpdateDto } from '../dtos/chat/user-for-update.dto';
import { Observable } from 'rxjs';
import { UserDto } from '../dtos/chat/user.dto';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  constructor(
    private http: HttpClient
  ) { }

  private API_ENDPOINT = environment.apiUrl;

  public isUsernameTaken(username: string): Observable<boolean> {
    const url = `${this.API_ENDPOINT}/users/has-duplicate-username/${username}`;
    return this.http.get<boolean>(url);
  }

  public isEmailTaken(email: string): Observable<boolean> {
    const url = `${this.API_ENDPOINT}/users/has-duplicate-email/${email}`;
    return this.http.get<boolean>(url);
  }

  public getUser(route: string) : Observable<UserDto> {
    return this.http.get<UserDto>(`${this.API_ENDPOINT}${route}`);
  }

  public updateUser(route: string, data: UserForUpdateDto) : Observable<UserForUpdateDto>{
    return this.http.put<UserForUpdateDto>(`${this.API_ENDPOINT}${route}`, data);
  }

  public uploadPicture(route: string, formData: FormData)  : Observable<string> {
    return this.http.post<string>(`${this.API_ENDPOINT}${route}`, formData);
  }

  public loadDisplayPicture(picturePath: string) : string {
    if(!picturePath || picturePath.trim().length === 0) {
      return 'https://api.dicebear.com/8.x/adventurer/svg?seed=Pepper'
    }
    return picturePath;
  }
}
