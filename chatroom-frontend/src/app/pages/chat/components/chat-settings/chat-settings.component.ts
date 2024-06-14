import { Component, ElementRef, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { NbDialogRef, NbDialogService, NbWindowService } from '@nebular/theme';
import { ChatDto } from '../../../../dtos/chat/chat.dto';
import { UserDto } from '../../../../dtos/chat/user.dto';
import { UserProfileService } from '../../../../services/user-profile.service';
import { ChatService } from '../../../../services/chat.service';
import { ErrorHandlerService } from '../../../../services/error-handler.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { Router } from '@angular/router';
import { ChatMemberDto } from '../../../../dtos/chat/chat-member.dto';
import { UserDisplayDto } from '../../../../dtos/chat/user-display.dto';

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
  @ViewChild('chatSettingsRef') chatSettingsRef? : TemplateRef<any>;
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

  ngAfterViewInit(){
  }
}
