import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { QRCodeComponent } from './qr-code.component';

@NgModule({
  declarations: [QRCodeComponent],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [QRCodeComponent]
})
export class QRCodeModule { }