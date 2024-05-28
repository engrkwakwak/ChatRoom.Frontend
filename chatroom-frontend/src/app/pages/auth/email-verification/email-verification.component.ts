import { Component } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthService, JwtToken } from '../../../services/auth.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'app-email-verification',
  templateUrl: './email-verification.component.html',
  styleUrl: './email-verification.component.scss'
})
export class EmailVerificationComponent {
  constructor(
    private toastService : NbToastrService,
    private authService : AuthService 
  ){}

  loading : boolean = false;
  public emailInterval : number = 0;

  private resetEmailInterval(){
    this.emailInterval = 60000;
  }

  public resendEmail(){
    this.loading = true;
    var token : JwtToken = this.authService.decodeAuthToken();
    this.authService.sendEmailVerification(parseInt(token.sub))
    .subscribe({
      next : () => {
        this.resetEmailInterval();
        this.toastService.show("Verification Link successfully sent.", "Email Sent", {
          status: "success"
        });
      },
      error: err => {
        // handle error
      },
      complete: () => this.loading = false
    })
  }

  ngOnInit(): void { 
    setInterval(()=>{
      if(this.emailInterval > 0){
        this.emailInterval -= 1000;
      }
    }, 1000);
  }
}
