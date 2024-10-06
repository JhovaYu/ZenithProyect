import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { LogoutButtonComponent } from '../components/logout-button/logout-button.component';



@NgModule({
  declarations: [LogoutButtonComponent],
  imports: [CommonModule, IonicModule],
  exports: [LogoutButtonComponent]
})
export class SharedModule { }
