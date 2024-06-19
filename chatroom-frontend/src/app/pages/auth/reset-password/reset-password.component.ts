import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { UpdatePasswordDto } from '../../../dtos/auth/update-password.dto';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ErrorHandlerService } from '../../../services/error-handler.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {

  constructor(
    private fb : FormBuilder,
    private router : Router,
    private activatedRoute : ActivatedRoute,
    private authService : AuthService,
    private errorHandlerService : ErrorHandlerService
  ){}

  showPassword : boolean = false;
  showPasswordConfirmation : boolean = false;
  loading : boolean = false;

  confirmPasswordValidator: ValidatorFn = (control : AbstractControl) : ValidationErrors | null => {
    if(this.password?.value != this.passwordConfirmation?.value){
      return {
        passwordMismatch  : true
      };
    }
    return null;
  }

  changePasswordForm : FormGroup = this.fb.group({
    password : ['', [Validators.required, Validators.minLength(8)]],
    passwordConfirmation : ['', [Validators.required, Validators.minLength(8)]]
  });

  get password () {
    return this.changePasswordForm.get("password");
  }

  get passwordConfirmation () {
    return this.changePasswordForm.get("passwordConfirmation")
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  toggleShowPasswordConfirmation() {
    this.showPasswordConfirmation = !this.showPasswordConfirmation;
  }

  changePasswordForm_Submit(){
    this.loading = true;

    const updatePasswordDto : UpdatePasswordDto = {
      Token : this.activatedRoute.snapshot.queryParamMap.get("token")!,
      Password : this.password?.value,
      PasswordConfirmation : this.passwordConfirmation?.value
    }

    this.authService.updatePassword(updatePasswordDto).subscribe({
      next: _ => this.authService.logout(),
      error: err => { 
        this.loading = false
        this.errorHandlerService.handleError(err)
      },
      complete: () => {
        this.loading = false
      }
    });
  }

  ngOnInit(){
    this.changePasswordForm.addValidators(this.confirmPasswordValidator);
    console.log()
  }

}
