import { Component } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-chat-contacts',
  templateUrl: './chat-contacts.component.html',
  styleUrl: './chat-contacts.component.scss'
})
export class ChatContactsComponent {
  constructor(
    private spinner : NgxSpinnerService
  ){}

  users: { name: string, title: string }[] = [
    { name: 'Carla Espinosa', title: 'Nurse' },
    { name: 'Bob Kelso', title: 'Doctor of Medicine' },
    { name: 'Janitor', title: 'Janitor' },
    { name: 'Perry Cox', title: 'Doctor of Medicine' },
    { name: 'Ben Sullivan', title: 'Carpenter and photographer' },
  ];

  loading : boolean = false;

  public search(ev : any){
    console.log(ev.target.value)
    this.toggleLoading();
    setTimeout(() => {
      this.toggleLoading();
    }, 5000);
  }

  public toggleLoading(){
    if(this.loading){
      this.spinner.hide();
      this.loading = false;
    }
    else{
      this.spinner.show();
      this.loading = true;
    }
  }

  ngOnInit(){
    // this.spinner.show();
  }
}
