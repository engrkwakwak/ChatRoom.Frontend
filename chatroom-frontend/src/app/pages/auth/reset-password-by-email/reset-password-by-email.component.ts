import { Component } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NbToastrService } from '@nebular/theme';
import { ErrorHandlerService } from '../../../services/error-handler.service';

@Component({
  selector: 'app-reset-password-by-email',
  templateUrl: './reset-password-by-email.component.html',
  styleUrl: './reset-password-by-email.component.scss'
})
export class ResetPasswordByEmailComponent {
  constructor(
    private fb : FormBuilder,
    private router : Router,
    private authService : AuthService,
    private nbToastr : NbToastrService,
    private errorHandler : ErrorHandlerService
  ){}

  loading : boolean = false;

  isEmailTakenValidator: AsyncValidatorFn = (control : AbstractControl) : Promise<ValidationErrors | null> => {
    return new Promise<ValidationErrors|null>(resolve => {
      this.authService.isEmailTaken(this.email?.value)
      .subscribe({
        next: res => {
          if(res){
            resolve(null)
          }
          resolve({notRegistered : true});
        }
      })
    })
  }

  resetForm : FormGroup = this.fb.group({
    email : ['', [Validators.required, Validators.maxLength(100)], [this.isEmailTakenValidator]],
  })

  get email () {
    return this.resetForm.get("email");
  }

  resetForm_Submit(){
    this.loading = true;
    this.authService.sendPasswordResetLinkByEmail(this.email?.value)
    .subscribe({
      next: _ => {
        this.nbToastr.success(
          `Password Reset link was sent to ${this.email?.value} email. Please check your email and follow the instructions.`, 
          "Password Reset",
          {
            duration: 4000
          }
        );
        this.router.navigate(["/signin"]);
        this.loading = false;
      },
      error : err => {
        this.errorHandler.handleError(err)
        this.loading = false;
      }
    })
  }

}
