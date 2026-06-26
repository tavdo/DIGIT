import { useEffect, useRef, useState } from 'react'
import { Camera, ImagePlus, Trash2, Video } from 'lucide-react'
import {
  formatAttachmentSize,
  MAX_TICKET_ATTACHMENTS,
  validateTicketAttachment,
} from '../utils/attachmentValidation'
import './TicketAttachmentPicker.css'

function TicketAttachmentPicker({ files, onChange, disabled = false, error = '' }) {
  const cameraInputRef = useRef(null)
  const galleryInputRef = useRef(null)
  const videoInputRef = useRef(null)
  const [localError, setLocalError] = useState('')
  const [previews, setPreviews] = useState([])

  useEffect(() => {
    const nextPreviews = files.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}`,
      file,
      url: URL.createObjectURL(file),
      kind: file.type.startsWith('video/') ? 'video' : 'image',
    }))

    setPreviews(nextPreviews)

    return () => {
      nextPreviews.forEach((preview) => URL.revokeObjectURL(preview.url))
    }
  }, [files])

  const addFiles = (selected) => {
    if (!selected.length) return

    const combined = [...files, ...selected].slice(0, MAX_TICKET_ATTACHMENTS)
    if (files.length + selected.length > MAX_TICKET_ATTACHMENTS) {
      setLocalError(`მაქსიმუმ ${MAX_TICKET_ATTACHMENTS} ფაილი შეგიძლია ატვირთო.`)
      return
    }

    for (const file of selected) {
      const validationError = validateTicketAttachment(file)
      if (validationError) {
        setLocalError(validationError)
        return
      }
    }

    setLocalError('')
    onChange(combined)
  }

  const handlePhotoSelect = (event) => {
    const selected = [...(event.target.files || [])]
    event.target.value = ''
    addFiles(selected)
  }

  const handleRemove = (previewId) => {
    const nextFiles = files.filter(
      (file) => `${file.name}-${file.size}-${file.lastModified}` !== previewId,
    )
    setLocalError('')
    onChange(nextFiles)
  }

  const displayError = error || localError
  const canAddMore = files.length < MAX_TICKET_ATTACHMENTS

  return (
    <div className="ticket-attachments">
      <div className="ticket-attachments__head">
        <span className="ticket-form__label">ფოტო</span>
        <span className="ticket-attachments__hint">
          დაამატე პრობლემის ფოტო (არასავალდებულო) · მაქს. {MAX_TICKET_ATTACHMENTS} · 10 MB
        </span>
      </div>

      {canAddMore && (
        <div className="ticket-attachments__pickers">
          <button
            type="button"
            className="ticket-attachments__picker-btn"
            onClick={() => cameraInputRef.current?.click()}
            disabled={disabled}
          >
            <Camera size={18} />
            ფოტოს გადაღება
          </button>
          <button
            type="button"
            className="ticket-attachments__picker-btn ticket-attachments__picker-btn--outline"
            onClick={() => galleryInputRef.current?.click()}
            disabled={disabled}
          >
            <ImagePlus size={18} />
            გალერეიდან
          </button>
          <button
            type="button"
            className="ticket-attachments__picker-btn ticket-attachments__picker-btn--outline"
            onClick={() => videoInputRef.current?.click()}
            disabled={disabled}
          >
            <Video size={18} />
            ვიდეო
          </button>
        </div>
      )}

      <div className="ticket-attachments__grid">
        {previews.map((preview) => (
          <div key={preview.id} className="ticket-attachments__preview">
            {preview.kind === 'image' ? (
              <img src={preview.url} alt={preview.file.name} />
            ) : (
              <div className="ticket-attachments__video">
                <video src={preview.url} muted playsInline />
                <Video size={18} />
              </div>
            )}
            <div className="ticket-attachments__meta">
              <span>{preview.file.name}</span>
              <small>{formatAttachmentSize(preview.file.size)}</small>
            </div>
            <button
              type="button"
              className="ticket-attachments__remove"
              onClick={() => handleRemove(preview.id)}
              disabled={disabled}
              aria-label="ფაილის წაშლა"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={handlePhotoSelect}
        disabled={disabled}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={handlePhotoSelect}
        disabled={disabled}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        hidden
        onChange={handlePhotoSelect}
        disabled={disabled}
      />

      {displayError && <p className="ticket-attachments__error">{displayError}</p>}
    </div>
  )
}

export default TicketAttachmentPicker
