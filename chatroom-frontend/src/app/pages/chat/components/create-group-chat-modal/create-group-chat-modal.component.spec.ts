import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateGroupChatModalComponent } from './create-group-chat-modal.component';

describe('CreateGroupChatModalComponent', () => {
  let component: CreateGroupChatModalComponent;
  let fixture: ComponentFixture<CreateGroupChatModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateGroupChatModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateGroupChatModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
