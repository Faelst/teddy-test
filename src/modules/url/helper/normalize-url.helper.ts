/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';

@Injectable()
export class NormalizeUrlHelper {
  exec(url: string): string | null {
    let u = url.trim();
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u;

    try {
      const parsed = new URL(u);

      if (!parsed.hostname) throw new Error('no host');
      return parsed.toString();
    } catch (_) {
      return null;
    }
  }
}
