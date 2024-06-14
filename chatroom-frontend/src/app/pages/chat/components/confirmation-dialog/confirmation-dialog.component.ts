import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { NbDialogRef, NbDialogService } from '@nebular/theme';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss'
})
export class ConfirmationDialogComponent {

  constructor(
    private nbDialogService : NbDialogService
  ){

  }

  @Input({required : true}) message : string | null = null;
  @Input() status : string = "basic";
  @Input({required :true}) title : string|null = null; 
  @Output() onContinue : EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('dialogTemplate') dialogTemplate? : TemplateRef<any>
  dialogRef? : NbDialogRef<any>


  cancel(){
    this.dialogRef?.close();
  }

  close(){
    this.dialogRef?.close();
  }

  continue(){
    this.onContinue.emit();
  }

  open(){
    this.dialogRef = this.nbDialogService.open(this.dialogTemplate!)
  }


}
