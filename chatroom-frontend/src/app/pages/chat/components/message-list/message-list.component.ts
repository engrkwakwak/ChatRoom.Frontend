import { Component, Input, OnInit, ViewChild, AfterViewInit, SimpleChanges, OnChanges, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { MessageDto } from '../../../../dtos/chat/message.dto';
import { MessageParametersDto } from '../../../../dtos/shared/message-parameters.dto';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { NbChatComponent, NbDialogConfig, NbDialogRef, NbDialogService, NbWindowService } from '@nebular/theme';
import { MessageService } from '../../../../services/message.service';
import { ErrorHandlerService } from '../../../../services/error-handler.service';
import { UpdateMessageFormComponent } from '../update-message-form/update-message-form.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { UserProfileService } from '../../../../services/user-profile.service';
import { SignalRService } from '../../../../services/signal-r.service';
import { ChatMemberDto } from '../../../../dtos/chat/chat-member.dto';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.scss']
})
export class MessageListComponent implements OnInit, OnChanges, AfterViewInit {
  messages: MessageDto[] = [];
  selectedMessage : MessageDto|null = null;
  messageParameters: MessageParametersDto;
  isLoading: boolean = false;
  @Input({required: true}) currentUserId: number = 0;
  @Input({required: true}) chatId: number = 0;
  typingIndicatorStatus: boolean = false;
  @ViewChild('chatContainer') chatContainer!: NbChatComponent;
  @ViewChild('deleteMessageTemplate') deleteMessageTemplate : any;
  @ViewChild('deleteDialogComponent') deleteDialogComponent? : ConfirmationDialogComponent;
  @ViewChild('updateMessageComponent') updateMessageComponent? : UpdateMessageFormComponent;
  @Output() messageListUpdated = new EventEmitter<MessageDto>();


  constructor(
    private messageService: MessageService,
    private userProfileService : UserProfileService,
    private errorHandlerService : ErrorHandlerService,
    private signalRService :SignalRService
  ) {
    this.messageParameters = {
      HasNext: false,
      HasPrevious: false,
      PageNumber: 1,
      PageSize: 10,
      TotalCount: 0,
      TotalPages: 0
    };
  }
  
  ngOnInit(): void {
    this.loadMessages();
    this.signalRService.getTypingUser().subscribe((chatMember : ChatMemberDto) => {
      if(this.chatId == chatMember.chatId){
        this.typingIndicatorStatus = true;
        setTimeout(() => {
          this.typingIndicatorStatus = false;
        }, 2000);
      }
    });
  }

  ngAfterViewInit(): void {
    this.chatContainer.scrollable.nativeElement.addEventListener("scroll", (ev: any) => {
      if (ev.target.scrollTop == 0) {
        this.loadPrevious();
      }
    });
  }

  public onMessageUpdate(ev : MessageDto){
    this.messages.forEach((message : MessageDto, i : number) => {
      if(message.messageId == ev.messageId){
        this.messages[i].content = ev.content
      }
    });
  }

  public confirmDeleteMessage(message : MessageDto){
    this.selectedMessage = message;
    this.deleteDialogComponent?.open();
  }

  public deleteMessage(message : MessageDto){
    this.deleteDialogComponent?.close()
    this.messageService.deleteMessage(message.messageId, message.chatId)
    .subscribe({
      next: _ => {
        this.messages.forEach((message, i) => {
          if(message.messageId == this.selectedMessage?.messageId){
            this.messages.splice(i,1);
          }
        })
      },
      error: err => this.errorHandlerService.handleError(err)
    })
  }

  public showUpdateMessageComponent(message:MessageDto){
    this.selectedMessage = message
    this.updateMessageComponent?.show();
  }



  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chatId'] && !changes['chatId'].isFirstChange()) {
      this.messages = [];
      this.messageParameters.PageNumber = 1;
      this.loadMessages();
    }
  }

  public loadMessages(isLoadPrevious: boolean = false) {
    const apiUri: string = `/chats/${this.chatId}/messages?pageNumber=${this.messageParameters.PageNumber}&pageSize=${this.messageParameters.PageSize}`;
    this.messageService.getMessages(apiUri)
      .subscribe({
        next: (res: HttpResponse<MessageDto[]>) => {
          const newMessages = res.body?.reverse() ?? [];
          
          if (isLoadPrevious) {
            this.messages = [...newMessages, ...this.messages];
          } else {
            this.messages = newMessages;
            if(this.messages && this.messages.length > 0){
              this.messageListUpdated.emit(newMessages[newMessages.length - 1]);
            }
          }

          const paginationJson = res.headers.get('X-Pagination') ?? '{}';
          const pagination = JSON.parse(paginationJson);

          this.messageParameters.HasNext = pagination.HasNext ?? false;
          this.messageParameters.HasPrevious = pagination.HasPrevious ?? false;
          this.messageParameters.PageNumber = pagination.CurrentPage ?? 1;
          this.messageParameters.PageSize = pagination.PageSize ?? 10;
          this.messageParameters.TotalCount = pagination.TotalCount ?? 0;
          this.messageParameters.TotalPages = pagination.TotalPages ?? 0;

          if (isLoadPrevious) {
            const currentScrollHeight = this.chatContainer.scrollable.nativeElement.scrollHeight;
            setTimeout(() => {
              const newScrollHeight = this.chatContainer.scrollable.nativeElement.scrollHeight;
              this.chatContainer.scrollable.nativeElement.scrollTop = newScrollHeight - currentScrollHeight;
            }, 0);
          }

          this.isLoading = false;
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
        }
      });
  }

  public loadPrevious() {
    if (this.isLoading || !this.messageParameters.HasNext) {
      return;
    }

    this.isLoading = true;
    this.messageParameters.PageNumber++;
    this.loadMessages(true);
  }

  public pushMessage(message: MessageDto): void {
    this.messages.push(message);
    this.messageListUpdated.emit(message);
  }

  loadProfilePicture(message : MessageDto){
    return this.userProfileService.loadDisplayPicture(message.sender.displayPictureUrl, message.sender.displayName);
  }
}
