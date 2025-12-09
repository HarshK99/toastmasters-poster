// API route to get all meetings for admin
import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/database'
import { DatabaseMeeting } from '../../../lib/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { adminEmail } = req.query

    if (!adminEmail || typeof adminEmail !== 'string') {
      return res.status(400).json({ error: 'Admin email is required' })
    }

    console.log('Fetching meetings for admin:', adminEmail)

    // Get meetings from database, ordered by most recent first
    const { data: meetings, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('created_by', adminEmail)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: 'Failed to fetch meetings' })
    }

    console.log('Found meetings:', meetings?.length || 0)
    
    // Map database fields to frontend-friendly names for consistency
    const mappedMeetings = meetings?.map((meeting: DatabaseMeeting) => ({
      ...meeting,
      clubName: meeting.club_name,
      isActive: meeting.is_active,
      createdBy: meeting.created_by
    }))

    res.status(200).json({ meetings: mappedMeetings || [] })

  } catch (error) {
    console.error('Server error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}