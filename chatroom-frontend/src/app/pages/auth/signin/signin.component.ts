import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.scss'
})
export class SigninComponent {
  constructor(
    private router : Router
  ){}
  showPassword = true;

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  gotoSignUp(){
    this.router.navigate(["/signup"]);
  }
}
