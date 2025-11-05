// API route to submit a vote
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { meetingSlug, roleId, nominee, voterEmail, voterName } = req.body

    if (!meetingSlug || !roleId || !nominee || !voterEmail || !voterName) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Create mock vote data (since we're not using real database)
    const vote = {
      id: `vote-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      meeting_slug: meetingSlug,
      role_id: roleId,
      nominee,
      voter_email: voterEmail,
      voter_name: voterName,
      created_at: new Date().toISOString()
    }

    console.log('Mock vote submitted:', vote)

    res.status(201).json({ 
      vote,
      message: 'Vote submitted successfully (mock data)'
    })

  } catch (error) {
    console.error('Server error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}