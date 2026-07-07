export const MAX_TICKET_ATTACHMENTS = 5
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024

const IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
])
const VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime'])
const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif'])
const VIDEO_EXTENSIONS = new Set(['mp4', 'webm', 'mov'])

function kindFromExtension(fileName) {
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (IMAGE_EXTENSIONS.has(ext)) return 'image'
  if (VIDEO_EXTENSIONS.has(ext)) return 'video'
  return null
}

export function getAttachmentKind(file) {
  if (IMAGE_TYPES.has(file.type) || file.type.startsWith('image/')) return 'image'
  if (VIDEO_TYPES.has(file.type) || file.type.startsWith('video/')) return 'video'
  return kindFromExtension(file.name)
}

export function validateTicketAttachment(file) {
  const kind = getAttachmentKind(file)
  if (!kind) {
    return 'დაშვებულია მხოლოდ ფოტო (JPG, PNG, WEBP, HEIC) და ვიდეო (MP4, WEBM, MOV).'
  }

  const maxSize = kind === 'image' ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES
  if (file.size > maxSize) {
    const limitMb = Math.round(maxSize / (1024 * 1024))
    return `${kind === 'image' ? 'ფოტოს' : 'ვიდეოს'} მაქსიმალური ზომაა ${limitMb} MB.`
  }

  return null
}

export function validateTicketAttachmentSelection(files) {
  if (files.length > MAX_TICKET_ATTACHMENTS) {
    return `მაქსიმუმ ${MAX_TICKET_ATTACHMENTS} ფაილი შეგიძლია ატვირთო.`
  }

  for (const file of files) {
    const error = validateTicketAttachment(file)
    if (error) return error
  }

  return null
}

export function formatAttachmentSize(bytes) {
  if (!bytes || bytes <= 0) return ''
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getStorageErrorMessage(error) {
  return error?.message || 'ფაილის ატვირთვა ვერ მოხერხდა.'
}
