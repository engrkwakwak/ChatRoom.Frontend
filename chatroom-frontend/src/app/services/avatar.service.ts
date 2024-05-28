import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AvatarService {

  constructor(private http : HttpClient) { }

  /* 
   use this api for generating avatar https://www.dicebear.com/playground/
  */
 public generate(name : string ) : Observable<any> {
  return this.http.get(`https://api.dicebear.com/8.x/identicon/svg?seed=${name}`);
 }
 
}
