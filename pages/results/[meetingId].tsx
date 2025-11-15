import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { Meeting, VoteResults } from '../../types/voting'
import ResultsDisplay from '../../components/voting/ResultsDisplay'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import Loading from '@/components/ui/Loading'

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <Loading message="Loading results..." variant="center" className="pt-24 sm:pt-28" />
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-8 pt-24 sm:pt-28">
        <ResultsDisplay
          meeting={meeting}
          results={results}
        />
      </div>
      <Footer />
    </div>
  )
}