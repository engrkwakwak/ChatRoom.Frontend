import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';
import { NbButtonModule, NbCardModule, NbFormFieldModule, NbIconModule, NbInputModule, NbLayoutModule, NbSpinnerComponent, NbSpinnerModule } from '@nebular/theme';
import { BrandNameComponent } from './components/brand-name/brand-name.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



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
    FormsModule,
    NbSpinnerModule
  ]
})
export class AuthModule { }
