import { Injectable } from '@angular/core';
import * as bcrypt from 'bcryptjs';

@Injectable({
  providedIn: 'root'
})
export class HashService {

  constructor() { }


  hashPassword(password: string): Promise<string> {
    const saltRounds = 10;

    return new Promise<string>((resolve, reject) => {
      bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) {
          reject(err);
        } else {
          bcrypt.hash(password, salt, (err, hash) => {
            if (err) {
              reject(err);
            } else {
              resolve(hash);
            }
          });
        }
      });
    });
  }
}
