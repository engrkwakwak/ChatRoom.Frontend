import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { ChatForCreationDto } from '../../../../dtos/chat/chat-for-creation.dto';
import { ChatType, Status } from '../../../../shared/enums';
import { UserProfileService } from '../../../../services/user-profile.service';
import { ErrorHandlerService } from '../../../../services/error-handler.service';

@Component({
  selector: 'app-create-group-chat-modal',
  templateUrl: './create-group-chat-modal.component.html',
  styleUrl: './create-group-chat-modal.component.scss'
})
export class CreateGroupChatModalComponent implements OnInit, OnDestroy {
  groupChatForm!: FormGroup;
  uploadedImageUrl: string | null = null;

  constructor(
    protected ref: NbDialogRef<CreateGroupChatModalComponent>,
    private userService: UserProfileService,
    private errorHandlerService: ErrorHandlerService
  ){}

  ngOnDestroy(): void {
    if(this.uploadedImageUrl) {
      this.deletePicture(this.uploadedImageUrl);
    }
  }

  ngOnInit(): void {
    this.groupChatForm = this.createGroupChatForm();
  }

  createGroupChatForm(): FormGroup {
    return new FormGroup({
      groupName: new FormControl('', [
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

  dismiss(){
    this.ref.close();
  }

  continue(){
    if(this.groupChatForm.valid) {
      const groupChat: ChatForCreationDto = this.mapFormValuesToDto(this.groupChatForm.value);
      this.uploadedImageUrl = null;
      this.ref.close(groupChat);
    }
  }

  onFileChange(event: any){
    const input = event.target as HTMLInputElement;
    if(input.files && input.files.length > 0) {
      const file = input.files[0];
      if(this.validateFile(file)) {
        if(this.uploadedImageUrl) {
          this.deletePicture(this.uploadedImageUrl);
        }
        this.uploadPicture(file);
      }
    }
  }

  validateFile(file: File): boolean {
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      alert('Invalid file type. Please select an image file. Available image types are "jpeg, jpg, png, gif, bmp, and webp".');
      return false;
    }
    return true;
  }

  uploadPicture(file: File) {
    const formData: FormData = new FormData();
    formData.append('ImageFile', file, file.name);
    formData.append('FileName', file.name);
    formData.append('ContentType', file.type);
    formData.append('ContainerName', 'chat-display-pictures');
    
    this.userService.uploadPicture(formData).subscribe({
      next: (fileUrl) => {
        this.uploadedImageUrl = fileUrl;
      },
      error: (err) => this.errorHandlerService.handleError(err)
    });
  }

  public deletePicture(fileUri: string) {
    this.userService.deletePicture(fileUri).subscribe({
      next: () => {
        this.uploadedImageUrl = null;
      },
      error: (err) => this.errorHandlerService.handleError(err)
    });
  }

  validateControl = (controlName: string) => {
    const control = this.groupChatForm.get(controlName);
    return control?.invalid && (control?.touched || control?.dirty);
  }

  hasError = (controlName: string, errorName: string) => {
    return this.groupChatForm.get(controlName)?.hasError(errorName);
  }

  loadDisplayImage(): string {
    return this.userService.loadDisplayPicture(this.uploadedImageUrl ?? '', 'groupChat');
  }

  private mapFormValuesToDto(formValues: any): ChatForCreationDto {
    return {
      chatName: formValues.groupName,
      chatTypeId: ChatType.GroupChat,
      statusId: Status.Active,
      chatMemberIds: [],
      displayPictureUrl: this.uploadedImageUrl ?? undefined
    };
  }
}
