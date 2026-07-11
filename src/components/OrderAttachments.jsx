import { Film, ImageIcon } from 'lucide-react'
import './OrderAttachments.css'

const normalizeAttachments = (list) => {
  if (!list || !Array.isArray(list)) return []
  return list.map((att, i) => {
    if (typeof att === 'string') {
      const isImg = /\.(jpg|jpeg|png|webp|gif|svg|heic)($|\?)/i.test(att)
      return {
        id: `legacy-${i}`,
        url: att,
        name: att.split('/').pop() || `ფაილი ${i + 1}`,
        kind: isImg ? 'image' : 'video'
      }
    }
    const isImg = att.kind
      ? att.kind === 'image'
      : /\.(jpg|jpeg|png|webp|gif|svg|heic)($|\?)/i.test(att.url || att.name || '')
    return {
      ...att,
      id: att.id || `att-${i}`,
      url: att.url || '',
      name: att.name || `ფაილი ${i + 1}`,
      kind: isImg ? 'image' : 'video'
    }
  })
}

function OrderAttachments({ attachments, title = 'მიმაგრებული ფაილები' }) {
  const normalized = normalizeAttachments(attachments)
  if (!normalized.length) return null

  return (
    <section className="order-attachments">
      <h3 className="order-attachments__title">{title}</h3>
      <div className="order-attachments__grid">
        {normalized.map((attachment) => (
          <a
            key={attachment.id}
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`order-attachments__item order-attachments__item--${attachment.kind}`}
          >
            {attachment.kind === 'image' ? (
              <img src={attachment.url} alt={attachment.name} loading="lazy" />
            ) : (
              <div className="order-attachments__video">
                <video src={attachment.url} preload="metadata" muted playsInline />
                <span className="order-attachments__video-badge">
                  <Film size={14} />
                  ვიდეო
                </span>
              </div>
            )}
            <span className="order-attachments__name">{attachment.name}</span>
          </a>
        ))}
      </div>
    </section>
  )
}

export function OrderAttachmentsCompact({ attachments }) {
  const normalized = normalizeAttachments(attachments)
  if (!normalized.length) return null

  const imageCount = normalized.filter((item) => item.kind === 'image').length
  const videoCount = normalized.filter((item) => item.kind === 'video').length

  return (
    <p className="order-attachments__compact">
      {imageCount > 0 && (
        <span>
          <ImageIcon size={14} aria-hidden />
          {imageCount} ფოტო
        </span>
      )}
      {videoCount > 0 && (
        <span>
          <Film size={14} aria-hidden />
          {videoCount} ვიდეო
        </span>
      )}
    </p>
  )
}

export default OrderAttachments
