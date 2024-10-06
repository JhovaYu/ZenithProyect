import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentTabsPage } from './student-tabs.page';

describe('StudentTabsPage', () => {
  let component: StudentTabsPage;
  let fixture: ComponentFixture<StudentTabsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentTabsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
