// API route to submit a vote
import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { meetingSlug, roleId, nominee, voterEmail, voterName } = req.body

    if (!meetingSlug || !roleId || !nominee || !voterEmail || !voterName) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // First, get the meeting ID from slug
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id')
      .eq('slug', meetingSlug)
      .eq('is_active', true)
      .single()

    if (meetingError || !meeting) {
      return res.status(404).json({ error: 'Meeting not found' })
    }

    // Insert or update vote
    const { data: vote, error } = await supabase
      .from('votes')
      .upsert({
        meeting_id: meeting.id,
        role_id: roleId,
        nominee,
        voter_email: voterEmail,
        voter_name: voterName
      })
      .select()
      .single()

    if (error) {
      console.error('Vote error:', error)
      return res.status(500).json({ error: 'Failed to submit vote' })
    }

    res.status(201).json({ vote })

  } catch (error) {
    console.error('Server error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}