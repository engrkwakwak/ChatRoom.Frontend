import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  constructor(
    private router : Router,
    private jwtHelper : JwtHelperService
  ){}

  gotoSignUp(){
    this.router.navigate(['/signup']);
  }

  isUserAuthenticated = (): boolean => {
    const token = localStorage.getItem("chatroom-token");

    if(token && !this.jwtHelper.isTokenExpired(token)){
      return true;
    }

    return false;
  }
  
  logOut = () => {
    localStorage.removeItem("chatroom-token");
  }
}
