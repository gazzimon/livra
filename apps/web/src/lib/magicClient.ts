'use client';
import { Magic } from 'magic-sdk';

let magic: Magic | null = null;

export function getMagic() {
  if (typeof window === 'undefined') return null;
  if (!magic) magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY!);
  return magic;
}
