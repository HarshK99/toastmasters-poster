// API route to get voting results
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { slug } = req.query

    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ error: 'Invalid slug' })
    }

    // Create mock results data for testing
    const mockResults = [
      {
        roleId: 'toastmaster',
        roleName: 'Toastmaster',
        totalVotes: 1,
        results: [{ nominee: 'TM John Smith', count: 1 }]
      }
    ]

    res.status(200).json({ 
      meeting: {
        name: `Test Meeting - ${slug}`,
        date: new Date().toISOString().split('T')[0],
        clubName: 'Test Toastmasters Club'
      },
      results: mockResults,
      message: 'Results retrieved successfully (mock data)'
    })

  } catch (error) {
    console.error('Server error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
