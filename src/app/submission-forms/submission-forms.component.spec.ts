import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmissionFormsComponent } from './submission-forms.component';

describe('SubmissionFormsComponent', () => {
  let component: SubmissionFormsComponent;
  let fixture: ComponentFixture<SubmissionFormsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubmissionFormsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmissionFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
