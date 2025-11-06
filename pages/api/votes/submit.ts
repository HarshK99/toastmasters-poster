// API route to submit a vote
import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { meetingSlug, roleId, nominee, voterEmail, voterName } = req.body

    console.log('Vote submission request:', { meetingSlug, roleId, nominee, voterEmail, voterName })

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
      console.error('Meeting lookup error:', meetingError)
      return res.status(404).json({ error: 'Meeting not found' })
    }

    console.log('Found meeting:', meeting)

    // Check if user has already voted for this role
    const { data: existingVote, error: checkError } = await supabase
      .from('votes')
      .select('id')
      .eq('meeting_id', meeting.id)
      .eq('role_id', roleId)
      .eq('voter_email', voterEmail)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error checking existing vote:', checkError)
      return res.status(500).json({ error: 'Failed to check existing votes' })
    }

    if (existingVote) {
      return res.status(409).json({ 
        error: 'You have already voted for this role',
        code: 'ALREADY_VOTED',
        roleId
      })
    }

    // Insert new vote
    const { data: vote, error } = await supabase
      .from('votes')
      .insert({
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
      
      // Handle specific constraint violation
      if (error.code === '23505') {
        return res.status(409).json({ 
          error: 'Vote already exists for this role. Please refresh and try again.',
          code: 'DUPLICATE_VOTE'
        })
      }
      
      return res.status(500).json({ error: 'Failed to submit vote' })
    }

    console.log('Vote submitted successfully:', vote)
    res.status(201).json({ vote })

  } catch (error) {
    console.error('Server error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}