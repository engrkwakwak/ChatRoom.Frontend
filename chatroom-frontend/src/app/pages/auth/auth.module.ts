import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';
import { NbButtonModule, NbCardModule, NbFormFieldModule, NbIconModule, NbInputModule, NbLayoutModule } from '@nebular/theme';
import { BrandNameComponent } from './components/brand-name/brand-name.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';



@NgModule({
  declarations: [
    SigninComponent,
    SignupComponent,
    BrandNameComponent
  ],
  imports: [
    CommonModule,
    NbLayoutModule,
    NbInputModule,
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbFormFieldModule,
    ReactiveFormsModule,
    HttpClientModule
  ]
})
export class AuthModule { }
