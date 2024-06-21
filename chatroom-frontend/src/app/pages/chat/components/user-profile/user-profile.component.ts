import { Component, Input, OnInit } from '@angular/core';
import { UserProfileService } from '../../../../services/user-profile.service';
import { formatDate } from '@angular/common';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { UserDto } from '../../../../dtos/chat/user.dto';
import { HttpErrorResponse } from '@angular/common/http';
import { UserForUpdateDto } from '../../../../dtos/chat/user-for-update.dto';
import { jwtDecode } from 'jwt-decode';
import { Observable, map, of } from 'rxjs';
import { NbDialogRef, NbToastrService } from '@nebular/theme';
import { ErrorHandlerService } from '../../../../services/error-handler.service';
import { ChatService } from '../../../../services/chat.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {
  @Input({required: true}) userId!: number;
  isUserFormEditable: boolean = false;
  user!: UserDto;
  userForm!: FormGroup;

  constructor(
    private userService: UserProfileService,
    private toastrService: NbToastrService,
    private errorHandlerService: ErrorHandlerService,
    private chatService: ChatService,
    private router: Router,
    protected dialogRef: NbDialogRef<UserProfileComponent>,
  ){
  }

  ngOnInit(): void {
    this.userForm = this.createUserForm();
    this.isUserFormEditable = this.checkIfUserFormEditable();
    this.setUserFormState();
    this.getUserById();
  }

  sendMessage(): void {
    if (this.chatService.isMobile) {
      this.chatService.hideChatlist();
    }
    this.router.navigate([`/chat/view/from-contacts/${this.user.userId}`]);
    this.dialogRef.close();
  }

  checkIfUserFormEditable(): boolean {
    const sessionUserId: number = this.userService.getUserIdFromToken();
    return sessionUserId === this.userId
  }

  createUserForm(): FormGroup {
    return new FormGroup({
      username: new FormControl('', {
        validators: [Validators.required, Validators.maxLength(20), Validators.pattern("[A-Za-z0-9_]+")],
        asyncValidators: [this.isUsernameTakenValidator]
      }),
      displayName: new FormControl('', [this.noWhiteSpaceValidator, Validators.maxLength(50)]),
      email: new FormControl('', {
        validators: [Validators.required, Validators.maxLength(100), Validators.email],
        asyncValidators: [this.isEmailTakenValidator]
      }),
      address: new FormControl('', Validators.maxLength(100)),
      birthDate: new FormControl('', [this.pastDateValidator])
    });
  }

  setUserFormState(): void {
    if(!this.isUserFormEditable) {
      this.userForm.get('birthDate')?.disable();
      this.userForm.get('displayName')?.disable();
      this.userForm.get('email')?.disable();
      this.userForm.get('username')?.disable();
      this.userForm.get('address')?.disable();
    }
  }

  private noWhiteSpaceValidator(control: AbstractControl): ValidationErrors | null {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { whitespace: true };
  }

  private isUsernameTakenValidator: AsyncValidatorFn = (control: AbstractControl): Observable<ValidationErrors | null> => {
    if(this.user.username === control.value) {
      return of(null);
    }
    return this.userService.isUsernameTaken(control.value).pipe(
      map(res => (res ? { usernameTaken: true } : null))
    );
  }

  private isEmailTakenValidator: AsyncValidatorFn = (control: AbstractControl): Observable<ValidationErrors | null> => {
    if(this.user.email === control.value) {
      return of(null);
    }
    return this.userService.isEmailTaken(control.value).pipe(
      map(res => (res ? { emailTaken: true } : null))
    );
  }

  private pastDateValidator(control: AbstractControl): ValidationErrors | null {
    const selectedDate = new Date(control.value);
    const now = new Date();
    // Remove time part of date
    selectedDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    // Check if the selected date is in the future
    if (selectedDate > now) {
      return { futureDate: true };
    }
    return null;
  }

  private getUserById(): void {
    const uri: string = `/users/${this.userId}`;
  
    this.userService.getUser(uri).subscribe({
      next: (userEntity: UserDto) => {
        this.user = { 
          ...userEntity,
          birthDate: userEntity.birthDate ? new Date(userEntity.birthDate) : undefined,
          dateCreated: userEntity.dateCreated ? new Date(userEntity.dateCreated) : undefined,
          displayPictureUrl: userEntity.displayPictureUrl ?? ''
        };

        this.userForm.patchValue(this.user);
      },
      error: (err: HttpErrorResponse) => console.log(err),
    });
  }

  validateControl = (controlName: string) => {
    const control = this.userForm.get(controlName);
    return control?.invalid && (control?.touched || control?.dirty);
  }

  hasError = (controlName: string, errorName: string) => {
    return this.userForm.get(controlName)?.hasError(errorName);
  }
  
  public updateUser() {
    if(this.userForm.valid) {
      this.executeUserUpdate();
    }
  }

  private mapUserFormValuesToDto(formValues: any): UserForUpdateDto {
    return {
      DisplayName: formValues.displayName,
      Email: formValues.email,
      Username: formValues.username,
      Address: formValues.address,
      BirthDate: formValues.birthDate  ? formatDate(formValues.birthDate, 'yyyy-MM-dd', 'en-US') : undefined,
      DisplayPictureUrl: this.user.displayPictureUrl
    }
  }

  private executeUserUpdate() {
    const user: UserForUpdateDto = this.mapUserFormValuesToDto(this.userForm.value);
    const apiUri: string = `/users/${this.user.userId}`;

    this.userService.updateUser(apiUri, user)
    .subscribe({
      next: (_) => {
        this.toastrService.success("User profile updated successfully!", 'Success');
        this.dialogRef.close();
      },
       error: (err: HttpErrorResponse) => console.log(err)//this.errorHandler.handleError(err)
    })
  }

  public uploadPicture(file:File) {
    const formData = new FormData();
    formData.append('file', file, file.name);
    const apiUri: string = `/users/${this.user.userId}/picture`;
    this.userService.uploadPicture(apiUri, formData).subscribe({
      next: (fileUrl) => {
        this.user.displayPictureUrl = fileUrl;
      },
      error: (err) => this.errorHandlerService.handleError(err)
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

  validateFile(file: File): boolean {
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      alert('Invalid file type. Please select an image file. Available image types are "jpeg, jpg, png, gif, bmp, and webp".');
      return false;
    }
    return true;
  }

  public loadDisplayPicture() : string {
    const pictureUrl: string = this.user?.displayPictureUrl ?? '';
    const name: string = this.user?.displayName ?? 'default';
    return this.userService.loadDisplayPicture(pictureUrl, name);
  }
}
