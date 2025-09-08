import { getApps, initializeApp, applicationDefault } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

const app =
  getApps()[0] ??
  initializeApp({
    credential: applicationDefault(), // ✅ Usa ADC (Cloud Run / Hosting)
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    projectId: process.env.GOOGLE_CLOUD_PROJECT, // opcional, infiere en GCP
  })

export const db = getFirestore(app)
export const bucket = getStorage(app).bucket()
