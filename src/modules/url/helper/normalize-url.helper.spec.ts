import { NormalizeUrlHelper } from './normalize-url.helper';

describe('NormalizeUrlHelper', () => {
  let sut: NormalizeUrlHelper;

  beforeEach(() => {
    sut = new NormalizeUrlHelper();
  });

  it('should prepend https when protocol is missing', () => {
    const out = sut.exec('example.com');
    expect(out).toBe('https://example.com/');
  });

  it('should keep http scheme and normalize trailing slash', () => {
    const out = sut.exec('http://example.com');
    expect(out).toBe('http://example.com/');
  });

  it('should keep https scheme and preserve path and query', () => {
    const out = sut.exec('https://example.com/path?q=1');
    expect(out).toBe('https://example.com/path?q=1');
  });

  it('should trim whitespace before processing', () => {
    const out = sut.exec('   example.com   ');
    expect(out).toBe('https://example.com/');
  });

  it('should accept localhost with port', () => {
    const out = sut.exec('localhost:3000');
    expect(out).toBe('https://localhost:3000/');
  });

  it('should return null for invalid url (missing host)', () => {
    const out = sut.exec('https://'); // URL() throws
    expect(out).toBeNull();
  });

  it('should return null for empty string', () => {
    const out = sut.exec('   ');
    expect(out).toBeNull();
  });
});
