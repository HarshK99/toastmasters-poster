// API route to create a new meeting
import { NextApiRequest, NextApiResponse } from 'next'
import { supabase, generateSlug } from '../../../lib/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { name, date, clubName, createdBy, roles } = req.body

    if (!name || !date || !clubName || !createdBy || !roles) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Generate unique slug
    const slug = generateSlug(name, clubName)

    // Insert meeting into database
    const { data: meeting, error } = await supabase
      .from('meetings')
      .insert({
        slug,
        name,
        date,
        club_name: clubName,
        created_by: createdBy,
        roles
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: 'Failed to create meeting' })
    }

    // Return the meeting with URL
    const meetingUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/voting/${slug}`
    
    res.status(201).json({
      meeting,
      url: meetingUrl
    })

  } catch (error) {
    console.error('Server error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}