import { Star, User } from 'lucide-react'
import DeveloperCvSummary from '../DeveloperCvSummary'
import { formatDeveloperRating } from '../../services/orderService'
import {
  formatReviewDate,
  renderStarRating,
} from '../../services/developerReviewService'
import './DeveloperPublicProfile.css'

function DeveloperReviewList({ reviews, loading }) {
  if (loading) {
    return <p className="dev-public__reviews-empty">შეფასებები იტვირთება...</p>
  }

  if (reviews.length === 0) {
    return (
      <p className="dev-public__reviews-empty">
        ჯერ არ არის შეფასებები. დასრულებული სამუშაოების შემდეგ ბიზნესები დატოვებენ რეიტინგს.
      </p>
    )
  }

  return (
    <ul className="dev-public__reviews">
      {reviews.map((review) => (
        <li key={review.id} className="dev-public__review">
          <div className="dev-public__review-top">
            <span className="dev-public__review-stars" aria-label={`${review.rating} ვარსკვლავი`}>
              {renderStarRating(review.rating)}
            </span>
            <span className="dev-public__review-date">{formatReviewDate(review.createdAt)}</span>
          </div>
          {review.review && <p className="dev-public__review-text">{review.review}</p>}
          <p className="dev-public__review-meta">
            {review.customerName}
            {review.serviceType && <> · {review.serviceType}</>}
          </p>
        </li>
      ))}
    </ul>
  )
}

export default function DeveloperPublicProfile({ profile, reviews, reviewsLoading }) {
  if (!profile) return null

  const completedJobs = profile.ratingCount ?? 0

  return (
    <div className="dev-public">
      <header className="dev-public__header">
        <div className="dev-public__avatar">
          <User size={28} />
        </div>
        <div className="dev-public__identity">
          <h1>{profile.name || 'შემსრულებელი'}</h1>
          <p className="dev-public__rating">
            <Star size={16} />
            {formatDeveloperRating(profile)}
          </p>
          <p className="dev-public__meta">
            {completedJobs > 0
              ? `${completedJobs} დასრულებული სამუშაო · პროფესიონალური პროფილი`
              : 'ახალი შემსრულებელი'}
          </p>
        </div>
      </header>

      <section className="dev-public__section">
        <h2>სპეციალისტის CV</h2>
        <DeveloperCvSummary profile={profile} />
      </section>

      <section className="dev-public__section">
        <h2>შეფასებები და მიმოხილვები</h2>
        <DeveloperReviewList reviews={reviews} loading={reviewsLoading} />
      </section>
    </div>
  )
}
