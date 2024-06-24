import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { NbDialogRef, NbDialogService, NbToastrService, NbWindowService } from '@nebular/theme';
import { ChatDto } from '../../../../dtos/chat/chat.dto';
import { UserProfileService } from '../../../../services/user-profile.service';
import { ChatService } from '../../../../services/chat.service';
import { ErrorHandlerService } from '../../../../services/error-handler.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { Router } from '@angular/router';
import { ChatMemberDto } from '../../../../dtos/chat/chat-member.dto';
import { UserDisplayDto } from '../../../../dtos/chat/user-display.dto';
import { ChatMembersComponent } from '../chat-members/chat-members.component';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ChatForUpdateDto } from '../../../../dtos/chat/chat-for-update.dto';

@Component({
  selector: 'app-chat-settings',
  templateUrl: './chat-settings.component.html',
  styleUrl: './chat-settings.component.scss'
})
export class ChatSettingsComponent implements OnInit, OnChanges {

  constructor(
    private nbDialogService : NbDialogService,
    private userProfileService : UserProfileService,
    private chatService : ChatService,
    private errorHandlerService : ErrorHandlerService,
    private router : Router,
    private toastrService: NbToastrService
  ){}

  ngOnInit(): void {
    this.chatForm = this.createGroupChatForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chat'] && changes['chat'].currentValue) {
      this.chatForm.patchValue({
        chatName: this.chat?.chatName
      });
    }
  }

  @Input({required:true}) chat? : ChatDto|null = null;
  @Input({required:true}) members : ChatMemberDto[] = [];
  @Output() onChatDelete : EventEmitter<any> = new EventEmitter<any>();
  @Output() chatChangesSaved = new EventEmitter<ChatDto>();

  @ViewChild('deleteChatDialogComponent') deleteChatDialogComponent? : ConfirmationDialogComponent;
  @ViewChild('leaveChatDialogComponent') leaveChatDialogComponent? : ConfirmationDialogComponent;
  @ViewChild('chatSettingsRef') chatSettingsRef? : TemplateRef<any>;
  @ViewChild('chatMembersRef') chatMembersComponent? : ChatMembersComponent;
  dialogRef! : NbDialogRef<any>;
  chatForm!: FormGroup;

  open(){
    this.dialogRef = this.nbDialogService.open(this.chatSettingsRef!);
  }

  close(){
    this.dialogRef.close();
  }

  createGroupChatForm(): FormGroup {
    return new FormGroup({
      chatName: new FormControl('', [
        Validators.maxLength(50),
        this.noWhiteSpaceValidator
      ])
    });
  }

  noWhiteSpaceValidator(control: AbstractControl): ValidationErrors | null {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { whitespace: true };
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
    this.leaveChatDialogComponent!.loading = true;
    this.chatService.leaveChat(this.chat?.chatId!)
    .subscribe({
      next : _ => {
        this.chatService.onGroupChatLeave.next(this.chat!);
        this.router.navigate(["/chat"]);
        this.leaveChatDialogComponent?.close();
        this.leaveChatDialogComponent!.loading = false;
      },
      error : err => {
        this.leaveChatDialogComponent?.close();
        this.errorHandlerService.handleError(err);
        this.leaveChatDialogComponent!.loading = false;
      }
    });
  }

  public onFileChange(event: any) {
    const input = event.target as HTMLInputElement;
    if(input.files && input.files.length > 0) {
      const file = input.files[0];
      if(this.validateFile(file)) {
        this.uploadPicture(file);
      }
    }
  }
  uploadPicture(file: File) {
    const formData = new FormData();
    formData.append('file', file, file.name);

    const apiUri: string = `/chats/display-picture`;
    this.userProfileService.uploadPicture(apiUri, formData).subscribe({
      next: (fileUrl) => {
        if(fileUrl && this.chat){
          this.chat!.displayPictureUrl = fileUrl
        }
        
      },
      error: (err) => this.errorHandlerService.handleError(err)
    });
  }

  validateFile(file: File): boolean {
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      alert('Invalid file type. Please select an image file. Available image types are "jpeg, jpg, png, gif, bmp, and webp".');
      return false;
    }
    return true;
  }

  updateChat() {
    const chat: ChatForUpdateDto = {
      chatName: this.chatForm.value.chatName,
      displayPictureUrl: this.chat?.displayPictureUrl
    };

    const apiUrl: string =  `/chats/${this.chat?.chatId}`;
    this.chatService.updateChat(apiUrl, chat).subscribe({
      next: () => {
        this.chat!.chatName = chat.chatName;
        this.chatChangesSaved.emit(this.chat!);
        this.toastrService.success('Group chat information is successfully updated.');
      },
      error: (err: HttpErrorResponse) => this.errorHandlerService.handleError(err)
    });
  }
}