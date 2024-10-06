import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AttendanceOptionsComponent } from './attendance-options.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  declarations: [AttendanceOptionsComponent],
  exports: [AttendanceOptionsComponent]
})
export class AttendanceOptionsModule { }