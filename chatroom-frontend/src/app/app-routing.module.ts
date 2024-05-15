import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { SigninComponent } from './pages/auth/signin/signin.component';
import { SignupComponent } from './pages/auth/signup/signup.component';
import { ChatComponent } from './pages/chat/chat.component';
import { ChatIndexComponent } from './pages/chat/chat-index/chat-index.component';
import { ChatViewComponent } from './pages/chat/chat-view/chat-view.component';

const routes: Routes = [
  {path: "", component: HomeComponent},
  {path: "home", redirectTo: ""},
  {path: "signin", component: SigninComponent},
  {path: "signup", component: SignupComponent},
  {
    path: "chat", 
    component: ChatComponent,
    children: [
      { path: "", component: ChatIndexComponent },
      { path: "view/:id", component: ChatViewComponent },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
