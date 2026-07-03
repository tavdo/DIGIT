import {
  formatExperienceCategories,
  formatExperienceYears,
} from '../../utils/developerProfile'
import {
  formatReviewDate,
  renderStarRating,
} from '../../services/developerReviewService'
import { User, Loader2 } from 'lucide-react'
import './DeveloperPublicProfile.css'

export default function DeveloperPublicProfile({ profile, reviews, reviewsLoading }) {
  const ratingAvg = Number(profile.ratingAvg) || 0
  const ratingCount = profile.ratingCount || 0

  return (
    <div className="dev-pub-profile">
      {/* Profile Info Card */}
      <div className="dev-pub-card">
        <div className="dev-pub-card__header">
          <div className="dev-pub-card__avatar">
            <User size={36} />
          </div>
          <div className="dev-pub-card__identity">
            <h1>{profile.displayName || profile.name || 'შემსრულებელი'}</h1>
            <div className="dev-pub-card__rating">
              <span className="dev-pub-card__stars">{renderStarRating(ratingAvg)}</span>
              {ratingCount > 0 ? (
                <span>
                  {ratingAvg.toFixed(1)} ({ratingCount} შეფასება)
                </span>
              ) : (
                <span>შეფასების გარეშე</span>
              )}
            </div>
          </div>
        </div>

        <dl className="dev-pub-card__details">
          <div>
            <dt>გამოცდილება</dt>
            <dd>{formatExperienceYears(profile.experienceYears)}</dd>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <dt>სპეციალიზაცია (კატეგორიები)</dt>
            <dd>{formatExperienceCategories(profile.experienceCategories)}</dd>
          </div>
        </dl>

        {profile.bio && (
          <div className="dev-pub-card__bio">
            <h3>ბიოგრაფია / ჩემს შესახებ</h3>
            <p>{profile.bio}</p>
          </div>
        )}
      </div>

      {/* Reviews Card */}
      <div className="dev-reviews-section">
        <h2>კლიენტების შეფასებები ({reviews.length})</h2>

        {reviewsLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
            <Loader2 className="animate-spin" size={16} />
            იტვირთება შეფასებები...
          </div>
        ) : reviews.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>შეფასებები ჯერ არ არის.</p>
        ) : (
          <div className="dev-reviews-list">
            {reviews.map((review) => (
              <div key={review.id} className="dev-review-item">
                <div className="dev-review-item__header">
                  <div className="dev-review-item__meta">
                    <span className="dev-review-item__author">{review.customerName}</span>
                    <span className="dev-review-item__date">
                      {formatReviewDate(review.createdAt)}
                    </span>
                    {review.serviceType && (
                      <span className="dev-review-item__service">{review.serviceType}</span>
                    )}
                  </div>
                  <span className="dev-review-item__stars">
                    {renderStarRating(review.rating)}
                  </span>
                </div>
                {review.review && <p className="dev-review-item__comment">{review.review}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
