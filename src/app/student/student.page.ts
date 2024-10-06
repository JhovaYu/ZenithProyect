import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-student',
  templateUrl: './student.page.html',
  styleUrls: ['./student.page.scss'],
})
export class StudentPage implements OnInit {
  userData: any = {};

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.getUserData();
  }

  getUserData() {
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders().set('Authorization', token);
      this.http.get('http://localhost:3000/api/user', { headers }).subscribe({
        next: (data: any) => {
          this.userData = data;
        },
        error: (error) => {
          console.error('Error al obtener datos del usuario', error);
        }
      });
    }
  }

}
