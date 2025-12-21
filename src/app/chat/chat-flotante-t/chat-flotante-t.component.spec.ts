import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatFlotanteTComponent } from './chat-flotante-t.component';

describe('ChatFlotanteTComponent', () => {
  let component: ChatFlotanteTComponent;
  let fixture: ComponentFixture<ChatFlotanteTComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatFlotanteTComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChatFlotanteTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
