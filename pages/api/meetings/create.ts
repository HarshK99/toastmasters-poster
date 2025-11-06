// API route to create a new meeting
import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/database'

// Local slug generator to avoid importing supabase client during API runtime
const generateSlug = (meetingName: string, clubName: string): string => {
  const slug = `${meetingName}-${clubName}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  return `${slug}-${randomSuffix}`
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { name, date, clubName, createdBy, roles, code } = req.body

    console.log('Meeting creation request:', { name, date, clubName, createdBy, roles: roles?.length, code })

    if (!date || !roles) {
      return res.status(400).json({ error: 'Missing required fields: date and roles' })
    }

    // Generate unique slug
    const meetingName = name || `Meeting - ${date}`
    const club = clubName || 'Toastmasters Club'
    const creator = createdBy || 'admin'
    
    // Use provided short code if supplied; otherwise generate a slug
    const slug = code && typeof code === 'string' && code.length >= 3 ? code : generateSlug(meetingName, club)

    console.log('Generated slug:', slug)

    // Insert meeting into database
    const { data: meeting, error } = await supabase
      .from('meetings')
      .insert({
        slug,
        name: meetingName,
        date,
        club_name: club,
        created_by: creator,
        roles,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: 'Failed to create meeting' })
    }

    console.log('Meeting created successfully:', meeting)

    // Generate meeting URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const url = `${baseUrl}/voting/${slug}`

    res.status(200).json({ 
      meeting,
      url,
      message: 'Meeting created successfully'
    })
  } catch (error) {
    console.error('Error creating meeting:', error)
    res.status(500).json({ error: 'Failed to create meeting' })
  }
}