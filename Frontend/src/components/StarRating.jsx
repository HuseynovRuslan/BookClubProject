import { useRef, useState } from 'react';

const starPath = 'm12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z';

/**
 * Star rating in the Bookla 2.0 style.
 * Read-only (no onRatingChange, or disabled): the Make "★★★★★" line, terracotta for filled stars.
 * Interactive (onRatingChange): a keyboard-accessible radio group of star buttons.
 *
 * @param {Object} props
 * @param {number} props.rating - Current rating value (1-5)
 * @param {Function} [props.onRatingChange] - Callback when rating changes (makes it interactive)
 * @param {number} [props.maxStars=5] - Maximum number of stars
 * @param {string} [props.size='md'] - Size: 'sm', 'md', 'lg', 'xl'
 * @param {boolean} [props.showValue=false] - Show numeric value next to stars
 * @param {boolean} [props.disabled=false] - Disable interaction
 * @param {string} [props.label] - Accessible name of the input group
 * @param {string} [props.className] - Additional CSS classes
 */
const StarRating = ({
  rating = 0,
  onRatingChange,
  maxStars = 5,
  size = 'md',
  showValue = false,
  disabled = false,
  label = 'Qiymət',
  className = '',
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const buttonsRef = useRef([]);

  const isInteractive = !!onRatingChange && !disabled;
  const sizeClass = `star-rating-${['sm', 'md', 'lg', 'xl'].includes(size) ? size : 'md'}`;
  const value = showValue && (
    <span className="star-rating-value">{rating > 0 ? Number(rating).toFixed(1) : '—'}</span>
  );

  if (!onRatingChange) {
    const filled = Math.max(0, Math.min(maxStars, Math.round(rating)));
    return (
      <span className={`star-rating star-rating-readonly ${sizeClass} ${className}`}>
        <span className="stars" role="img" aria-label={`${maxStars} ulduzdan ${filled}`}>
          {'★'.repeat(filled)}
          <span className="stars-empty">{'★'.repeat(maxStars - filled)}</span>
        </span>
        {value}
      </span>
    );
  }

  const select = (starIndex) => {
    if (isInteractive) onRatingChange(starIndex);
  };

  // Arrow keys move the selection like a native radio group.
  const handleKeyDown = (event) => {
    if (!isInteractive) return;
    const step = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[event.key];
    let next = null;
    if (step) next = Math.min(maxStars, Math.max(1, (rating || 0) + step));
    if (event.key === 'Home') next = 1;
    if (event.key === 'End') next = maxStars;
    if (next === null) return;
    event.preventDefault();
    onRatingChange(next);
    buttonsRef.current[next - 1]?.focus();
  };

  const displayRating = hoverRating || rating;
  const focusIndex = rating > 0 ? rating : 1;

  return (
    <span className={`star-rating star-rating-input ${sizeClass} ${disabled ? 'is-disabled' : ''} ${className}`}>
      <span
        aria-disabled={disabled || undefined}
        aria-label={label}
        className="star-rating-stars"
        onKeyDown={handleKeyDown}
        onMouseLeave={() => setHoverRating(0)}
        role="radiogroup"
      >
        {Array.from({ length: maxStars }, (_, index) => {
          const starIndex = index + 1;
          const isFilled = starIndex <= displayRating;
          return (
            <button
              aria-checked={rating === starIndex}
              aria-label={`${maxStars} ulduzdan ${starIndex}`}
              className={`star-button ${isFilled ? 'filled' : ''}`}
              disabled={!isInteractive}
              key={starIndex}
              onClick={() => select(starIndex)}
              onMouseEnter={() => isInteractive && setHoverRating(starIndex)}
              ref={(node) => {
                buttonsRef.current[index] = node;
              }}
              role="radio"
              tabIndex={starIndex === focusIndex ? 0 : -1}
              type="button"
            >
              <svg aria-hidden="true" className="icon" viewBox="0 0 24 24">
                <path d={starPath} />
              </svg>
            </button>
          );
        })}
      </span>
      {value}
    </span>
  );
};

export default StarRating;
