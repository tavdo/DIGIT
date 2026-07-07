export async function uploadOrderAttachments(orderId, customerId, files) {
  if (!files?.length) return []

  const attachments = []
  const token = localStorage.getItem('token')

  for (const file of files) {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/orders/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    if (!res.ok) {
      throw new Error('ფაილის ატვირთვა ვერ მოხერხდა.')
    }

    const data = await res.json()
    attachments.push({
      id: crypto.randomUUID(),
      name: file.name,
      url: data.url,
      size: file.size,
      uploadedBy: customerId,
    })
  }

  if (attachments.length > 0) {
    const patchRes = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ attachments })
    })
    if (!patchRes.ok) {
      throw new Error('შეკვეთის მონაცემების განახლება ვერ მოხერხდა.')
    }
  }

  return attachments
}

export async function uploadCompletionAttachment(orderId, developerId, file) {
  if (!file) return null

  const token = localStorage.getItem('token')
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch('/api/orders/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  })

  if (!res.ok) {
    throw new Error('ფაილის ატვირთვა ვერ მოხერხდა.')
  }

  const data = await res.json()
  const completionAttachment = {
    id: crypto.randomUUID(),
    name: file.name,
    url: data.url,
    uploadedBy: developerId,
    uploadedAt: new Date().toISOString(),
  }

  const patchRes = await fetch(`/api/orders/${orderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ completionAttachment })
  })

  if (!patchRes.ok) {
    throw new Error('შეკვეთის მონაცემების განახლება ვერ მოხერხდა.')
  }

  return completionAttachment
}
