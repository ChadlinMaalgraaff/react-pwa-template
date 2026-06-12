import React from 'react'

interface CardProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

/**
 * Reusable Card Component
 * Container for content with optional title and description
 */
const Card: React.FC<CardProps> = ({
  title,
  description,
  children,
  className = '',
}) => {
  return (
    <div className={`card ${className}`}>
      {title && <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>}
      {description && <p className="text-gray-600 mb-4">{description}</p>}
      {children}
    </div>
  )
}

export default Card
