import { Magic } from '@magic-sdk/admin'

let magic: Magic | null = null

export function getMagicAdmin() {
  if (!magic) {
    magic = new Magic(process.env.MAGIC_SECRET_KEY!)
  }
  return magic
}
