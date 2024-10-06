import { Injectable } from '@angular/core';
import { NFC, Ndef } from '@awesome-cordova-plugins/nfc/ngx';

@Injectable({
  providedIn: 'root'
})
export class NfcServiceService {

  constructor(private nfc: NFC, private ndef: Ndef) { }

  async writeNFC(message: string): Promise<void> {
    try {
      let ndefRecord = this.ndef.textRecord(message);
      await this.nfc.write([ndefRecord]);
    } catch (error) {
      console.error('Error writing NFC:', error);
      throw error;
    }
  }
}
