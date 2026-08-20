export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '::wellbeing-hub-salt');
  const buffer = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

export function hashPasswordSync(password: string): string {
  let h1 = 0xdeadbeef ^ 0x9e3779b9;
  let h2 = 0x41c6ce57 ^ 0x9e3779b9;
  const input = password + '::wellbeing-hub-salt';
  for (let i = 0, ch; i < input.length; i++) {
    ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const a = (h1 >>> 0).toString(16).padStart(8, '0');
  const b = (h2 >>> 0).toString(16).padStart(8, '0');
  return a + b;
}

export function generateUid(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buf = new Uint8Array(6);
    crypto.getRandomValues(buf);
    for (let i = 0; i < buf.length; i++) {
      out += chars[buf[i] % chars.length];
    }
  } else {
    for (let i = 0; i < 6; i++) {
      out += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return 'WB-' + out;
}
