// API route to update meeting
import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { slug, name, date, clubName, roles } = req.body

    if (!slug || !name || !date || !clubName || !roles) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Update meeting in database
    const { data: meeting, error } = await supabase
      .from('meetings')
      .update({
        name,
        date,
        club_name: clubName,
        roles,
        updated_at: new Date().toISOString()
      })
      .eq('slug', slug)
      .select()
      .single()

    if (error || !meeting) {
      return res.status(404).json({ error: 'Meeting not found or update failed' })
    }

    res.status(200).json({ meeting })

  } catch (error) {
    console.error('Server error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}