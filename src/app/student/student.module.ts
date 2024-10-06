import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { StudentPageRoutingModule } from './student-routing.module';
import { StudentPage } from './student.page';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

@NgModule({
  providers: [
    provideHttpClient(withInterceptorsFromDi())
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StudentPageRoutingModule
  ],
  declarations: [StudentPage]
})
export class StudentPageModule {}
