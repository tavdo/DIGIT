import path from 'path'
import { put } from '@vercel/blob'

export function isVercelRuntime() {
  return Boolean(process.env.VERCEL)
}

export function useBlobStorage() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

export async function saveUploadedFile(file) {
  const ext = path.extname(file.originalname || '')
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`

  if (isVercelRuntime() && !useBlobStorage()) {
    throw new Error(
      'File uploads on Vercel require Blob storage. Add a Blob store in your Vercel project settings.'
    )
  }

  if (useBlobStorage() && file.buffer) {
    const blob = await put(`uploads/${filename}`, file.buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: file.mimetype
    })
    return blob.url
  }

  return `/uploads/${file.filename}`
}
