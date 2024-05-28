import { Component } from '@angular/core';
import { UserProfileService } from '../../../../services/user-profile.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, formatDate } from '@angular/common';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { UserDto } from '../../../../dtos/chat/user.dto';
import { HttpErrorResponse } from '@angular/common/http';
import { UserForUpdateDto } from '../../../../dtos/chat/user-for-update.dto';
import { jwtDecode } from 'jwt-decode';
import { Observable, map, of } from 'rxjs';
import { NbDialogService, NbToastrService } from '@nebular/theme';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent {
  user!: UserDto;
  userForm!: FormGroup;
  displayName: string = "";
  constructor(
    private userService: UserProfileService,
    private toastrService: NbToastrService
  ){
  }

  ngOnInit(): void {
    this.userForm = new FormGroup({
      username: new FormControl('', {
        validators: [Validators.required, Validators.maxLength(20), Validators.pattern("[A-Za-z0-9_]+")],
        asyncValidators: [this.isUsernameTakenValidator]
      }),
      displayName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      email: new FormControl('', {
        validators: [Validators.required, Validators.maxLength(100), Validators.email],
        asyncValidators: [this.isEmailTakenValidator]
      }),
      address: new FormControl('', Validators.maxLength(100)),
      birthDate: new FormControl('', [this.pastDateValidator])
    });

    this.getUserById();
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
    var userId: number = 0;
    const token = localStorage.getItem('chatroom-token');
    if(token){
      const decodedToken = jwtDecode<any>(token);
      userId = decodedToken['sub'];
    }
    const userByIdUri: string = `/users/${userId}`;
  
    this.userService.getUser(userByIdUri)
    .subscribe({
      next: (userEntity: UserDto) => {

        this.user = { 
          ...userEntity,
          birthDate: userEntity.birthDate ? new Date(userEntity.birthDate) : undefined,
          dateCreated: userEntity.dateCreated ? new Date(userEntity.dateCreated) : undefined
        }
        this.displayName = userEntity.displayName;
        this.userForm.patchValue(this.user);
        
      },
      error: (err: HttpErrorResponse) => console.log(err),
    })
  }

  validateControl = (controlName: string) => {
    if (this.userForm.get(controlName)?.invalid && this.userForm.get(controlName)?.touched)
      return true;
    return false;
  }

  hasError = (controlName: string, errorName: string) => {
    if(this.userForm.get(controlName)?.hasError(errorName))
      return true;
    return false;
  }
  
  public updateUser = (userFormValue: UserDto) => {
    if(this.userForm.valid)
      this.executeUserUpdate(userFormValue);
  }

  private executeUserUpdate = (userFormValue: UserDto) => {
    const userForUpd: UserForUpdateDto = {
      Username: userFormValue.username,
      DisplayName: userFormValue.displayName,
      Email: userFormValue.email,
      Address: userFormValue.address,
      BirthDate: userFormValue.birthDate ? formatDate(userFormValue.birthDate, 'yyyy-MM-dd', 'en-US') : undefined
    }
    const apiUri: string = `/users/${this.user.userId}`;

    this.userService.updateUser(apiUri, userForUpd)
    .subscribe({
      next: (_) => {
        this.toastrService.success("User profile updated successfully!", 'Success');
        this.displayName= userForUpd.DisplayName;
      },
      // error: (err: HttpErrorResponse) => this.errorHandler.handleError(err)
    })
  }

  private updateTokenDetails(): void {
    const token = localStorage.getItem('chatroom-token');
    if(token){
      const decodedToken = jwtDecode<any>(token);
    }
  }
}
