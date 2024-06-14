import { ActivatedRouteSnapshot, CanActivateFn, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, concat, map, of, take } from 'rxjs';
import { Injectable } from '@angular/core';
import { ChatService } from '../services/chat.service';
import { ChatDto } from '../dtos/chat/chat.dto';

@Injectable({
  providedIn: 'root'
})
export class ChatGuard  {
  constructor(
    private authService : AuthService,
    private chatService : ChatService,
    private jwtHelper: JwtHelperService,
    private router : Router
  ){}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<GuardResult> {
    var token : any  = localStorage.getItem("chatroom-token");
    var decodedToken = this.jwtHelper.decodeToken(token);
    const chatId : number = parseInt(route.paramMap.get("chatId")!)

    return new Promise((resolve) => {
      concat(
        this.chatService.getChatByChatId(chatId) // checks if chat id exist or not deleted
        .pipe(
          map((chat:ChatDto, i:number) => {
            if(chat.statusId == 3){
                return false;
              }
              return true;
          })
        ),
        this.chatService.canViewChat(chatId) // checks if user has access to chat
        .pipe(
          map((canView :boolean, i:number) => {
            return canView;
          })
        )
      )
      .subscribe({
        next: canView => {
          if(!canView){
            this.router.navigate(["/error/404"]);
            resolve(false)
          }
          resolve(true)
        }
      });
      
    })
  }
}