import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostsubmitComponent } from './postsubmit.component';

describe('PostsubmitComponent', () => {
  let component: PostsubmitComponent;
  let fixture: ComponentFixture<PostsubmitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostsubmitComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostsubmitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
