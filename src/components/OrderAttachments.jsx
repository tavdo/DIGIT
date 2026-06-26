import { Film, ImageIcon } from 'lucide-react'
import './OrderAttachments.css'

function OrderAttachments({ attachments, title = 'მიმაგრებული ფაილები' }) {
  if (!attachments?.length) return null

  return (
    <section className="order-attachments">
      <h3 className="order-attachments__title">{title}</h3>
      <div className="order-attachments__grid">
        {attachments.map((attachment) => (
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
  if (!attachments?.length) return null

  const imageCount = attachments.filter((item) => item.kind === 'image').length
  const videoCount = attachments.filter((item) => item.kind === 'video').length

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
