import { useState } from 'react';
import { Star } from 'lucide-react';

/**
 * Reusable Star Rating Component
 * Supports both read-only (display) and interactive (input) modes
 * 
 * @param {Object} props
 * @param {number} props.rating - Current rating value (1-5)
 * @param {Function} [props.onRatingChange] - Callback when rating changes (makes it interactive)
 * @param {number} [props.maxStars=5] - Maximum number of stars
 * @param {string} [props.size='md'] - Size: 'sm', 'md', 'lg', 'xl'
 * @param {boolean} [props.showValue=false] - Show numeric value next to stars
 * @param {boolean} [props.disabled=false] - Disable interaction
 * @param {string} [props.className] - Additional CSS classes
 */
const StarRating = ({
  rating = 0,
  onRatingChange,
  maxStars = 5,
  size = 'md',
  showValue = false,
  disabled = false,
  className = '',
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const isInteractive = !!onRatingChange && !disabled;

  // Size configurations
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  const gapClasses = {
    sm: 'gap-0.5',
    md: 'gap-1',
    lg: 'gap-1',
    xl: 'gap-1.5',
  };

  const starSize = sizeClasses[size] || sizeClasses.md;
  const textSize = textSizeClasses[size] || textSizeClasses.md;
  const gap = gapClasses[size] || gapClasses.md;

  const handleClick = (starIndex) => {
    if (isInteractive) {
      onRatingChange(starIndex);
    }
  };

  const handleMouseEnter = (starIndex) => {
    if (isInteractive) {
      setHoverRating(starIndex);
    }
  };

  const handleMouseLeave = () => {
    if (isInteractive) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className={`flex items-center ${gap} ${className}`}>
      <div
        className={`flex items-center ${gap}`}
        onMouseLeave={handleMouseLeave}
      >
        {Array.from({ length: maxStars }, (_, index) => {
          const starIndex = index + 1;
          const isFilled = starIndex <= displayRating;
          const isHalfFilled = !isFilled && starIndex - 0.5 <= displayRating;

          return (
            <button
              key={starIndex}
              type="button"
              onClick={() => handleClick(starIndex)}
              onMouseEnter={() => handleMouseEnter(starIndex)}
              disabled={!isInteractive}
              className={`
                ${isInteractive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
                transition-transform duration-150 ease-out
                focus:outline-none
                disabled:cursor-default
              `}
              aria-label={`Rate ${starIndex} out of ${maxStars}`}
            >
              <Star
                className={`
                  ${starSize}
                  ${isFilled ? 'text-amber-400 fill-amber-400' : 'text-stone-300'}
                  ${isHalfFilled ? 'text-amber-400' : ''}
                  transition-colors duration-150
                `}
              />
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className={`${textSize} text-stone-600 font-medium ml-1`}>
          {rating > 0 ? rating.toFixed(1) : '—'}
        </span>
      )}
    </div>
  );
};

export default StarRating;
