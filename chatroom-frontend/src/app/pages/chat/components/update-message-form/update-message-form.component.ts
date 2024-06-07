import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MessageDto } from '../../../../dtos/chat/message.dto';
import { NbWindowRef, NbWindowService } from '@nebular/theme';
import { MessageService } from '../../../../services/message.service';
import { MessageForUpdateDto } from '../../../../dtos/chat/message-for-update.dto';
import { ErrorHandlerService } from '../../../../services/error-handler.service';

@Component({
  selector: 'app-update-message-form',
  templateUrl: './update-message-form.component.html',
  styleUrl: './update-message-form.component.scss'
})
export class UpdateMessageFormComponent {
  @Input({required:true}) message : MessageDto|null = null;
  @ViewChild('updateMessageTemplate') updateMessageTemplate : any;
  @ViewChild('messageInput') messageInput? : ElementRef;
  @Output() onUpdate : EventEmitter<MessageDto> = new EventEmitter<MessageDto>()
  updateWindowRef? : NbWindowRef;

  constructor(
    private nbWindowService : NbWindowService,
    private messageService : MessageService,
    private errorHandlerService : ErrorHandlerService
  ){}

  show(){
    this.updateWindowRef = this.nbWindowService.open(this.updateMessageTemplate, {
      title: "Edit Message",
      buttons : {
        minimize: false,
        maximize : false
      }
    })
  }

  updateMessage(){
    const message : MessageForUpdateDto = {
      MessageId : this.message?.messageId!,
      ChatId : this.message?.chatId!,
      Content : this.messageInput?.nativeElement.value
    }
    this.messageService.updateMessage(message)
    .subscribe({
      next : message => this.onUpdate.emit(message),
      error : err => this.errorHandlerService.handleError(err),
      complete : () => this.updateWindowRef?.close()
    })
  }
}
