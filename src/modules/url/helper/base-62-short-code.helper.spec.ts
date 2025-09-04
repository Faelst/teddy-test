import * as crypto from 'crypto';
import { Base62ShortCodeHelper } from './base-62-short-code.helper';

describe('Base62ShortCodeHelper', () => {
  let sut: Base62ShortCodeHelper;

  beforeEach(() => {
    sut = new Base62ShortCodeHelper();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should generate a 6-char base62 string', () => {
    const code = sut.gen6();
    expect(code).toMatch(/^[0-9a-zA-Z]{6}$/);
  });

  it('should likely generate different codes across samples', () => {
    const samples = Array.from({ length: 10 }, () => sut.gen6());
    samples.forEach((c) => expect(c).toMatch(/^[0-9a-zA-Z]{6}$/));
    expect(new Set(samples).size).toBeGreaterThan(1);
  });

  it('should produce "000000" when random bytes are zero (deterministic mock)', () => {
    jest
      .spyOn(crypto, 'randomBytes')
      .mockReturnValue(Buffer.alloc(8, 0) as any);
    const code = sut.gen6();
    expect(code).toBe('000000');
  });
});
