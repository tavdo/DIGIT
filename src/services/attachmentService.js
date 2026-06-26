import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db, storage } from '../firebase'
import { getAttachmentKind, getStorageErrorMessage } from '../utils/attachmentValidation'

function requireServices() {
  if (!db || !storage) {
    throw new Error('Firebase Storage არ არის კონფიგურირებული.')
  }
  return { firestore: db, storageClient: storage }
}

function sanitizeFileName(name) {
  return name.replace(/[^\w.\-()]+/g, '_').slice(0, 80) || 'file'
}

export async function uploadOrderAttachments(orderId, customerId, files) {
  if (!files?.length) return []

  const { firestore, storageClient } = requireServices()
  const attachments = []

  for (const file of files) {
    const kind = getAttachmentKind(file)
    if (!kind) {
      throw new Error('დაშვებულია მხოლოდ ფოტო და ვიდეო ფაილები.')
    }

    const fileId = crypto.randomUUID()
    const storagePath = `order-attachments/${orderId}/${fileId}-${sanitizeFileName(file.name)}`
    const storageRef = ref(storageClient, storagePath)

    try {
      await uploadBytes(storageRef, file, {
        contentType: file.type || (kind === 'image' ? 'image/jpeg' : 'video/mp4'),
      })
      const url = await getDownloadURL(storageRef)

      attachments.push({
        id: fileId,
        name: file.name,
        url,
        storagePath,
        kind,
        contentType: file.type || (kind === 'image' ? 'image/jpeg' : 'video/mp4'),
        size: file.size,
        uploadedBy: customerId,
      })
    } catch (err) {
      throw new Error(getStorageErrorMessage(err))
    }
  }

  if (attachments.length > 0) {
    await updateDoc(doc(firestore, 'orders', orderId), {
      attachments,
      updatedAt: serverTimestamp(),
    })
  }

  return attachments
}
