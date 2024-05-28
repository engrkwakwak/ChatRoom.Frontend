import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, CanActivateFn } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {

  constructor(private router:Router, private jwtHelper: JwtHelperService){}

  canActivate: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("chatroom-token");
      if (token && !this.jwtHelper.isTokenExpired(token)){
        // If user is already logged in and trying to access 'signin' or 'signup' page, redirect to main page
        if (route.routeConfig?.path === 'signin' || route.routeConfig?.path === 'signup') {
          this.router.navigate(["chat"]);
          return false;
        }
        return true;
      }
    }
    // If user is not logged in and trying to access 'signin' page, allow access
    if (route.routeConfig?.path === 'signin' || route.routeConfig?.path === 'signup') {
      return true;
    }
    this.router.navigate(["signin"]);
    return false;
  }
}
