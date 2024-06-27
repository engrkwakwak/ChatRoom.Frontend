import { Component } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, EmailValidator, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import SignUpDto from '../../../dtos/auth/signup.dto';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  constructor(
    private router : Router,
    private fb : FormBuilder,
    private auth : AuthService
  ){}

  signUpLoading = false;
  showPassword = false;
  showPasswordConfirmation = false;

  confirmPasswordValidator: ValidatorFn = (control : AbstractControl) : ValidationErrors | null => {
    if(this.password?.value != this.passwordConfirmation?.value){
      return {
        passwordMismatch  : true
      };
    }
    return null;
  }

  isEmailTakenValidator: AsyncValidatorFn = (control : AbstractControl) : Promise<ValidationErrors | null> => {
    return new Promise<ValidationErrors|null>(resolve => {
      this.auth.isEmailTaken(this.email?.value)
      .subscribe({
        next: res => {
          if(res){
            resolve({emailTaken : true})
          }
          resolve(null);
        }
      })
    })
  }

  isUsernameTakenValidator: AsyncValidatorFn = (control : AbstractControl) : Promise<ValidationErrors | null> => {
    return new Promise<ValidationErrors|null>(resolve => {
      this.auth.isUsernameTaken(this.username?.value)
      .subscribe({
        next: res => {
          if(res){
            resolve({usernameTaken : true})
          }
          resolve(null);
        }
      })
    })
  }

  signUpForm : FormGroup = this.fb.group({
    displayName : ['', [Validators.required, Validators.maxLength(50)]],
    username : ['', [Validators.required, Validators.maxLength(20), Validators.pattern("^[^\\s]+$")], [this.isUsernameTakenValidator]],
    email : ['', [Validators.required, Validators.maxLength(100), Validators.email], [this.isEmailTakenValidator]],
    password : ['', [Validators.required, Validators.minLength(8)]],
    passwordConfirmation : ['', [Validators.required, Validators.minLength(8)]]
  });

  validateControl = (controlName: string) => {
    const control = this.signUpForm.get(controlName);
    return control?.invalid && (control?.touched || control?.dirty);
  }

  hasError = (controlName: string, errorName: string) => {
    return this.signUpForm.get(controlName)?.hasError(errorName);
  }

  signUpForm_Submit(){
    this.toggleSignUpLoading();

    const data : SignUpDto = {
      DisplayName : this.displayName?.value,
      Username : this.username?.value,
      Email : this.email?.value,
      Password : this.password?.value,
      PasswordConfirmation : this.passwordConfirmation?.value
    }

    this.auth.signup(data).subscribe({
      next: (response) => {
        location.href = "/signin";
      },
      error: (error) => {
        this.toggleSignUpLoading()
        console.log(error)
      },
      complete: () => this.toggleSignUpLoading()
    });
  }

  get email () {
    return this.signUpForm.get("email");
  }

  get username () {
    return this.signUpForm.get("username");
  }

  get displayName () {
    return this.signUpForm.get("displayName");
  }

  get password () {
    return this.signUpForm.get("password");
  }

  get passwordConfirmation () {
    return this.signUpForm.get("passwordConfirmation")
  }

  toggleSignUpLoading(){
    this.signUpLoading = !this.signUpLoading;
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  toggleShowPasswordConfirmation() {
    this.showPasswordConfirmation = !this.showPasswordConfirmation;
  }

  gotoSignIn(){
    this.router.navigate(['/signin']);
  }

  ngOnInit(){
    this.signUpForm.addValidators(this.confirmPasswordValidator);
  }
}
