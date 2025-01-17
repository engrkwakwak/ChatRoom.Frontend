import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.scss',

})
export class SigninComponent {
  loginForm!: FormGroup;
  invalidLogin: boolean = false;
  showPassword = false;
  constructor(
    private router : Router,
    private fb : FormBuilder,
    private authService : AuthService
  ){
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, this.usernameValidator]],
      password: ['', Validators.required]
    })
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  gotoSignUp(){
    this.router.navigate(["/signup"]);
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.authService.signin({ username, password }).subscribe({
        next: ({ token }) => {
          localStorage.setItem('chatroom-token', token);
          this.invalidLogin = false;
          this.router.navigate(['chat']);
        },
        error: (err) => this.handleLoginError(err)
      });
    } else {
      this.markAllFieldsAsTouched();
    }
  }

  showResetPassword(){
    this.router.navigate([ '/auth/reset-password/email' ]);
  }

  private handleLoginError(err: any): void {
    if (err.status === 401) {
      this.invalidLogin = true;
    } else if (err.status === 422) {
      Object.entries(err.error).forEach(([field, error]) => {
        this.loginForm.controls[field.toLowerCase()].setErrors({ serverError: error });
      });
    } else {
      console.error('An error occurred: ', err.error);
      this.invalidLogin = true;
    }
  }

  private markAllFieldsAsTouched(): void {
    Object.values(this.loginForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  private usernameValidator(control: FormControl) {
    const value = control.value;
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    const isEmail = emailRegex.test(value);
    if (isEmail) {
      return value.length <= 100 ? null : { maxLength: true };
    } else {
      return value.length <= 20 ? null : { maxLength: true };
    }
  }

  validateControl = (controlName: string) => {
    const control = this.loginForm.get(controlName);
    return control?.invalid && (control?.touched || control?.dirty);
  }

  hasError = (controlName: string, errorName: string) => {
    return this.loginForm.get(controlName)?.hasError(errorName);
  }
}
