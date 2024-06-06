import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { NbDialogService } from '@nebular/theme';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss'
})
export class ConfirmationDialogComponent {
  @Input({required : true}) message : string | null = null;
  @Input() status : string = "basic";
  @Input({required :true}) title : string|null = null; 
  @Output() onCancel : EventEmitter<any> = new EventEmitter<any>();
  @Output() onContinue : EventEmitter<any> = new EventEmitter<any>();


  cancel(){
    this.onCancel.emit();
  }

  continue(){
    this.onContinue.emit();
  }


}
