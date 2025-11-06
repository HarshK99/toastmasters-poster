import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { Meeting, VoteResults } from '../../types/voting'
import ResultsDisplay from '../../components/voting/ResultsDisplay'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

export default function ResultsPage() {
  const router = useRouter()
  const { meetingId } = router.query
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [results, setResults] = useState<VoteResults[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load meeting data and results
  useEffect(() => {
    if (!meetingId || typeof meetingId !== 'string') return

    const loadMeetingAndResults = async () => {
      try {
        setLoading(true)
        
        // Load meeting data
        const meetingResponse = await fetch(`/api/meetings/${meetingId}`)
        if (!meetingResponse.ok) {
          throw new Error('Meeting not found')
        }
        const { meeting } = await meetingResponse.json()
        setMeeting(meeting)

        // Load results
        const resultsResponse = await fetch(`/api/votes/results?slug=${meeting.slug}`)
        if (resultsResponse.ok) {
          const { results } = await resultsResponse.json()
          setResults(results)
        } else {
          throw new Error('Failed to load results')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    loadMeetingAndResults()
  }, [meetingId])

  const handleClose = () => {
    router.push('/voting')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading results...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Results Not Found</h1>
            <p className="text-gray-600 mb-4">{error || 'The results you are looking for do not exist.'}</p>
            <button
              onClick={() => router.push('/voting')}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Back to Voting Dashboard
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <ResultsDisplay
          meeting={meeting}
          results={results}
          onClose={handleClose}
        />
      </div>
      <Footer />
    </div>
  )
}