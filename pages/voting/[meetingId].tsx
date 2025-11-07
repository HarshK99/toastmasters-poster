import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { Meeting } from '../../types/voting'
import VotingInterface from '../../components/voting/VotingInterface'
import Button from '../../components/ui/button'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

export default function MeetingVotingPage() {
  const router = useRouter()
  const { meetingId } = router.query
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string>('')

  // Generate or retrieve user ID from localStorage
  useEffect(() => {
    const getOrCreateUserId = () => {
      let storedUserId = localStorage.getItem('voting_user_id')
      if (!storedUserId) {
        storedUserId = `voter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('voting_user_id', storedUserId)
      }
      setUserId(storedUserId)
    }

    getOrCreateUserId()
  }, [])

  // Load meeting data
  useEffect(() => {
    if (!meetingId || typeof meetingId !== 'string') return

    const loadMeeting = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/meetings/${meetingId}`)
        
        if (!response.ok) {
          throw new Error('Meeting not found')
        }

        const { meeting } = await response.json()
        setMeeting(meeting)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load meeting')
      } finally {
        setLoading(false)
      }
    }

    loadMeeting()
  }, [meetingId])

  // Handle vote submission
  const handleVoteSubmitted = async () => {
    // Vote submitted successfully - no need to reload results since we use dedicated results page
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center pt-24 sm:pt-28">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading meeting...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center pt-24 sm:pt-28">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Meeting Not Found</h1>
            <p className="text-gray-600 mb-4">{error || 'The meeting you are looking for do not exist.'}</p>
            <Button onClick={() => router.push('/voting')}>
              Back to Voting
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-8 pt-24 sm:pt-28">
        {userId && meeting ? (
          <div className="max-w-4xl mx-auto">
            <VotingInterface
              meeting={meeting}
              onVoteSubmitted={handleVoteSubmitted}
              userId={userId}
            />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Setting up your voting session...</p>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}