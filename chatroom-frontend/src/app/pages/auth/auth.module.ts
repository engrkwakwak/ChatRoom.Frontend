import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';
import { NbButtonModule, NbCardModule, NbFormFieldModule, NbIconModule, NbInputModule, NbLayoutModule, NbSpinnerComponent, NbSpinnerModule, NbToastrModule, NbToastrService } from '@nebular/theme';
import { BrandNameComponent } from './components/brand-name/brand-name.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { EmailVerificationComponent } from './email-verification/email-verification.component';
import { EmailVerifiedComponent } from './email-verified/email-verified.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ChatModule } from '../chat/chat.module';
import { ResetPasswordByEmailComponent } from './reset-password-by-email/reset-password-by-email.component';



@NgModule({
  declarations: [
    SigninComponent,
    SignupComponent,
    BrandNameComponent,
    EmailVerificationComponent,
    EmailVerifiedComponent,
    ResetPasswordComponent,
    ResetPasswordByEmailComponent
  ],
  imports: [
    ChatModule,
    CommonModule,
    NbLayoutModule,
    NbInputModule,
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbFormFieldModule,
    ReactiveFormsModule,
    FormsModule,
    NbSpinnerModule,
    HttpClientModule,
    NbToastrModule.forRoot()
  ]
})
export class AuthModule { }
