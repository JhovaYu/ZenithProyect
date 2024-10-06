import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-teacher',
  templateUrl: './teacher.page.html',
  styleUrls: ['./teacher.page.scss'],
})
export class TeacherPage implements OnInit {
  teacherName: string = '';

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.teacherName = this.authService.getUserName();
  }

}
