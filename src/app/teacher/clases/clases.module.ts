import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClasesPageRoutingModule } from './clases-routing.module';

import { ClasesPage } from './clases.page';
import { AttendanceOptionsModule } from '../../components/attendance-options/attendance-options.module';
import { QRCodeModule } from '../../components/qr-code/qr-code.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClasesPageRoutingModule,
    QRCodeModule,
    AttendanceOptionsModule
  ],
  declarations: [ClasesPage]
})
export class ClasesPageModule {}
