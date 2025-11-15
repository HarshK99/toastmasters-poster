import React from 'react'
import Card from '@/components/ui/Card'

interface LoadingProps {
  message?: string
  variant?: 'card' | 'center' | 'inline'
  className?: string
}

const Inner: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <>
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
    <p className="text-gray-600">{message}</p>
  </>
)

const Loading: React.FC<LoadingProps> = ({ message = 'Loading...', variant = 'inline', className = '' }) => {
  if (variant === 'card') {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <div className="text-center py-8">
            <Inner message={message} />
          </div>
        </Card>
      </div>
    )
  }

  if (variant === 'center') {
    return (
      <div className={`flex-1 flex items-center justify-center ${className}`}>
        <div className="text-center py-8">
          <Inner message={message} />
        </div>
      </div>
    )
  }

  // inline
  return (
    <div className={className}>
      <div className="text-center py-8">
        <Inner message={message} />
      </div>
    </div>
  )
}

export default Loading
