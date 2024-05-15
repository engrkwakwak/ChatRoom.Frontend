import { HostListener, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})


export class ChatService {

  constructor() { }

  public isChatlistVisible : boolean = false;
  public isMobile = true;

  showChatlist(){
    this.isChatlistVisible = true;
  }

  hideChatlist(){
    this.isChatlistVisible = false;
  }

  showChatlistByScreenWidth(width:number){
    if(width > 768){
      this.showChatlist();
      this.isMobile = false;
    }
    else{
      this.hideChatlist();
      this.isMobile = true;
    }
  }

  
}
