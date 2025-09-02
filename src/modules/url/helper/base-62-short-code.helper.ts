import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

const alphabet =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BASE = BigInt(alphabet.length);
const MAX = BASE ** 6n;

@Injectable()
export class Base62ShortCodeHelper {
  gen6(): string {
    let rnd = BigInt('0x' + crypto.randomBytes(8).toString('hex')) % MAX;
    let s = '';

    for (let i = 0; i < 6; i++) {
      const rem = Number(rnd % BASE);
      s = alphabet[rem] + s;
      rnd = rnd / BASE;
    }

    return s;
  }
}
