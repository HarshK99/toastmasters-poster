// API route to submit votes in bulk
import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/database'

interface VoteSubmission {
  roleId: string;
  nominee: any;
}

interface BulkVoteRequest {
  meetingSlug: string;
  votes: VoteSubmission[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { meetingSlug, votes }: BulkVoteRequest = req.body

    console.log('Bulk vote submission request:', { meetingSlug, votesCount: votes?.length })

    if (!meetingSlug || !votes || !Array.isArray(votes) || votes.length === 0) {
      return res.status(400).json({ error: 'Missing required fields: meetingSlug and votes array' })
    }

    // Validate each vote has required fields
    for (const vote of votes) {
      if (!vote.roleId || !vote.nominee) {
        return res.status(400).json({ error: 'Each vote must have roleId and nominee' })
      }
    }

    // First, get the meeting ID from slug
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id')
      .eq('slug', meetingSlug)
      .eq('is_active', true)
      .single()

    if (meetingError || !meeting) {
      console.error('Meeting lookup error:', meetingError)
      return res.status(404).json({ error: 'Meeting not found' })
    }

    console.log('Found meeting:', meeting)

    // Prepare votes for bulk insertion
    const votesToInsert = votes.map((vote: VoteSubmission) => ({
      meeting_id: meeting.id,
      role_id: vote.roleId,
      nominee: vote.nominee
    }))

    console.log('Inserting votes:', votesToInsert)

    // Insert all votes in a single transaction
    const { data: insertedVotes, error } = await supabase
      .from('votes')
      .insert(votesToInsert)
      .select()

    if (error) {
      console.error('Bulk vote error:', error)
      return res.status(500).json({ error: 'Failed to submit votes' })
    }

    console.log('Votes submitted successfully:', insertedVotes.length)
    res.status(201).json({ 
      success: true, 
      message: `${insertedVotes.length} votes submitted successfully`,
      votes: insertedVotes
    })

  } catch (error) {
    console.error('Server error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}