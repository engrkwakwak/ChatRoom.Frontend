import { ActivatedRouteSnapshot, CanActivateFn, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, of, take } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmailVerifiedGuard  {
  constructor(
    private authService : AuthService,
    private jwtHelper: JwtHelperService,
    private router : Router
  ){}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<GuardResult> {
    var token : any  = localStorage.getItem("chatroom-token");
    var decodedToken = this.jwtHelper.decodeToken(token);

    return new Promise((resolve) => {
      this.authService.isEmailVerified(decodedToken.sub)
      .subscribe({
        next: isVerified => {
          if(!isVerified && route.routeConfig?.path === 'email-verification'){
            resolve(true)
          }
          if(!isVerified && route.routeConfig?.path != 'email-verification'){
            this.router.navigate(["/email-verification"]);
          }
          if(isVerified && route.routeConfig?.path === 'email-verification'){
            this.router.navigate(["/chat"]);
          }
          resolve(true);
        },
        error: err => {
          this.router.navigate(["/email-verification"]);
        }
      })
    })
  }
}