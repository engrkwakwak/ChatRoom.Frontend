import { Component, ElementRef, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { NbDialogRef, NbDialogService, NbWindowService } from '@nebular/theme';
import { ChatDto } from '../../../../dtos/chat/chat.dto';
import { UserProfileService } from '../../../../services/user-profile.service';
import { ChatService } from '../../../../services/chat.service';
import { ErrorHandlerService } from '../../../../services/error-handler.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { Router } from '@angular/router';
import { ChatMemberDto } from '../../../../dtos/chat/chat-member.dto';
import { UserDisplayDto } from '../../../../dtos/chat/user-display.dto';
import { ChatMembersComponent } from '../chat-members/chat-members.component';

@Component({
  selector: 'app-chat-settings',
  templateUrl: './chat-settings.component.html',
  styleUrl: './chat-settings.component.scss'
})
export class ChatSettingsComponent {

  constructor(
    private nbDialogService : NbDialogService,
    private userProfileService : UserProfileService,
    private chatService : ChatService,
    private errorHandlerService : ErrorHandlerService,
    private router : Router
  ){}

  @Input({required:true}) chat? : ChatDto|null = null;
  @Input({required:true}) members : ChatMemberDto[] = [];
  @Output() onChatDelete : EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('deleteChatDialogComponent') deleteChatDialogComponent? : ConfirmationDialogComponent;
  @ViewChild('leaveChatDialogComponent') leaveChatDialogComponent? : ConfirmationDialogComponent;
  @ViewChild('chatSettingsRef') chatSettingsRef? : TemplateRef<any>;
  @ViewChild('chatMembersRef') chatMembersComponent? : ChatMembersComponent;
  dialogRef! : NbDialogRef<any>;

  open(){
    this.dialogRef = this.nbDialogService.open(this.chatSettingsRef!);
  }

  close(){
    this.dialogRef.close();
  }

  loadDisplayPicture(){
    const receiver : UserDisplayDto|null = this.getReceiver();
    if(this.chat?.chatTypeId == 1){
      return this.userProfileService.loadDisplayPicture(receiver?.displayPictureUrl!, receiver?.displayName!);
    }
    return this.userProfileService.loadDisplayPicture(this.chat?.displayPictureUrl!, this.chat?.chatName!);
  }

  isAdmin(){
    const userId = this.userProfileService.getUserIdFromToken()
    return this.members.filter(member => {
      return member.user?.userId == userId || member.userId == userId
    })[0].isAdmin
  }

  getReceiver() : UserDisplayDto|null{
    const userId = this.userProfileService.getUserIdFromToken();
    if(this.chat?.chatTypeId == 1){
      return this.members.filter((member : ChatMemberDto, i:number) => {
        return member.user.userId != userId;
      })[0].user
    }
    return null;
  }

  confirmDeleteChat(){
    this.dialogRef.close();
    this.deleteChatDialogComponent?.open();
  }

  deleteChat(){
    this.deleteChatDialogComponent?.close();
    this.chatService.deleteChatByChatId(this.chat?.chatId!)
    .subscribe({
      next : _ => {
        console.log(_)
        this.onChatDelete.emit()
        this.router.navigate(["/chat"])
        // remove chat from chatlist 
      },
      error : err => this.errorHandlerService.handleError(err)
    })
  }

  showMembersDialog(){
    this.close()
    this.chatMembersComponent?.open();
  }

  confirmLeaveChat(){
    this.dialogRef.close();
    this.leaveChatDialogComponent?.open();
  }

  leaveChat(){
    
    this.chatService.leaveChat(this.chat?.chatId!)
    .subscribe({
      next : _ => {
        this.router.navigate(["/chat"]);
        this.leaveChatDialogComponent?.close();
      },
      error : err => {
        this.leaveChatDialogComponent?.close();
        this.errorHandlerService.handleError(err);
      }
    });
  }

  ngAfterViewInit(){
  }
}
