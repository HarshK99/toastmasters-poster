import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { Meeting, User } from '../../types/voting'
import VotingInterface from '../../components/voting/VotingInterface'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/button'

export default function MeetingVotingPage() {
  const router = useRouter()
  const { meetingId } = router.query
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  // Login form state
  const [loginName, setLoginName] = useState('')
  const [loginEmail, setLoginEmail] = useState('')

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

  // Check if user is admin
  useEffect(() => {
    if (meeting && user) {
      setIsAdmin(user.email === meeting.createdBy || user.email.includes('admin'))
    }
  }, [meeting, user])

  // Handle user login
  const handleLogin = () => {
    if (!loginName.trim() || !loginEmail.trim()) {
      alert('Please enter both name and email')
      return
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: loginName,
      email: loginEmail,
      role: loginEmail.includes('admin') ? 'admin' : 'member'
    }

    setUser(newUser)
  }

  // Handle vote submission
  const handleVoteSubmitted = async () => {
    // Vote submitted successfully - no need to reload results since we use dedicated results page
  }

  // Handle logout
  const handleLogout = () => {
    setUser(null)
    setLoginName('')
    setLoginEmail('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading meeting...</p>
        </div>
      </div>
    )
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Meeting Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The meeting you are looking for does not exist.'}</p>
          <Button onClick={() => router.push('/voting')}>
            Back to Voting
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {!user ? (
          /* Login Form */
          <div className="max-w-md mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Join Voting Session</h2>
              <div className="space-y-4">
                <Input
                  label="Your Name"
                  value={loginName}
                  onChange={setLoginName}
                  placeholder="Enter your name"
                />
                <Input
                  label="Email"
                  type="email"
                  value={loginEmail}
                  onChange={setLoginEmail}
                  placeholder="Enter your email"
                />
                <Button onClick={handleLogin} className="w-full">
                  Join Session
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Voting Interface */
          <div className="max-w-4xl mx-auto">
            <VotingInterface
              meeting={meeting}
              onVoteSubmitted={handleVoteSubmitted}
              userName={user.name}
              userEmail={user.email}
            />
            
            {isAdmin && (
              <div className="mt-8 flex justify-center gap-4">
                <Button 
                  onClick={() => window.open(`/results/${meetingId}`, '_blank')}
                  variant="secondary"
                >
                  🎭 View Results
                </Button>
                <Button 
                  onClick={() => router.push('/voting')}
                  variant="ghost"
                >
                  Back to Admin
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}