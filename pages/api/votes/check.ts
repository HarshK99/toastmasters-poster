// API route to check which roles a user has already voted for
import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { slug, voterEmail } = req.query

    if (!slug || !voterEmail || typeof slug !== 'string' || typeof voterEmail !== 'string') {
      return res.status(400).json({ error: 'Missing slug or voterEmail' })
    }

    // Get meeting ID from slug
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (meetingError || !meeting) {
      return res.status(404).json({ error: 'Meeting not found' })
    }

    // Get existing votes for this user in this meeting
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('role_id, nominee')
      .eq('meeting_id', meeting.id)
      .eq('voter_email', voterEmail)

    if (votesError) {
      console.error('Error fetching votes:', votesError)
      return res.status(500).json({ error: 'Failed to check existing votes' })
    }

    // Return the roles the user has already voted for
    const votedRoles = votes.reduce((acc, vote) => {
      acc[vote.role_id] = vote.nominee
      return acc
    }, {} as Record<string, { name: string; prefix: string }>)

    res.status(200).json({ votedRoles })

  } catch (error) {
    console.error('Server error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}