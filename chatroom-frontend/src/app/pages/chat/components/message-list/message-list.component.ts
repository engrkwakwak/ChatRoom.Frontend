import { Component, Input, OnInit, ViewChild, AfterViewInit, SimpleChanges, OnChanges, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { MessageDto } from '../../../../dtos/chat/message.dto';
import { MessageParametersDto } from '../../../../dtos/shared/message-parameters.dto';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { NbChatComponent } from '@nebular/theme';
import { MessageService } from '../../../../services/message.service';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.scss']
})
export class MessageListComponent implements OnInit, OnChanges, AfterViewInit {
  messages: MessageDto[] = [];
  messageParameters: MessageParametersDto;
  isLoading: boolean = false;
  @Input({required: true}) currentUserId: number = 0;
  @Input({required: true}) chatId: number = 0;
  @ViewChild('chatContainer') chatContainer!: NbChatComponent;
  @Output() messageListUpdated = new EventEmitter<MessageDto>();


  constructor(
    private messageService: MessageService
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
  }

  ngAfterViewInit(): void {
    this.chatContainer.scrollable.nativeElement.addEventListener("scroll", (ev: any) => {
      if (ev.target.scrollTop == 0) {
        this.loadPrevious();
      }
    });
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
}
