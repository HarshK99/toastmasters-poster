// API route to get meeting by slug
import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { slug } = req.query

    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ error: 'Invalid slug' })
    }

    // Get meeting from database
    const { data: meeting, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error || !meeting) {
      return res.status(404).json({ error: 'Meeting not found' })
    }

    res.status(200).json({ meeting })

  } catch (error) {
    console.error('Server error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}