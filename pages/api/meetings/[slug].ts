// API route to get meeting by slug
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

    // Create mock meeting data for testing (since we're not using real database)
    const meeting = {
      id: `meeting-${Date.now()}`,
      slug,
      name: `Test Meeting - ${slug}`,
      date: new Date().toISOString().split('T')[0],
      clubName: 'Test Toastmasters Club',
      createdBy: 'admin@test.com',
      roles: [
        {
          id: 'toastmaster',
          name: 'Toastmaster',
          nominees: [
            { name: 'John Smith', prefix: 'TM' as const },
            { name: 'Sarah Johnson', prefix: 'TM' as const },
            { name: 'Mike Wilson', prefix: 'Guest' as const }
          ]
        },
        {
          id: 'general-evaluator',
          name: 'General Evaluator',
          nominees: [
            { name: 'Jane Doe', prefix: 'TM' as const },
            { name: 'Bob Anderson', prefix: 'TM' as const },
            { name: 'Lisa Chen', prefix: 'TM' as const }
          ]
        },
        {
          id: 'timer',
          name: 'Timer',
          nominees: [
            { name: 'David Lee', prefix: 'TM' as const },
            { name: 'Emma Davis', prefix: 'TM' as const },
            { name: 'Alex Brown', prefix: 'Guest' as const }
          ]
        },
        {
          id: 'ah-counter',
          name: 'Ah Counter',
          nominees: [
            { name: 'Tom Garcia', prefix: 'TM' as const },
            { name: 'Maria Rodriguez', prefix: 'TM' as const }
          ]
        },
        {
          id: 'table-topics-master',
          name: 'Table Topics Master',
          nominees: [
            { name: 'Chris Taylor', prefix: 'TM' as const },
            { name: 'Amy White', prefix: 'TM' as const }
          ]
        },
        {
          id: 'speaker-1',
          name: 'Speaker 1',
          nominees: [
            { name: 'Kevin Miller', prefix: 'TM' as const },
            { name: 'Rachel Green', prefix: 'TM' as const }
          ]
        },
        {
          id: 'speaker-2',
          name: 'Speaker 2',
          nominees: [
            { name: 'Steve Clark', prefix: 'TM' as const },
            { name: 'Helen Moore', prefix: 'Guest' as const }
          ]
        },
        {
          id: 'evaluator-1',
          name: 'Evaluator 1',
          nominees: [
            { name: 'Daniel King', prefix: 'TM' as const },
            { name: 'Sophie Turner', prefix: 'TM' as const }
          ]
        },
        {
          id: 'evaluator-2',
          name: 'Evaluator 2',
          nominees: [
            { name: 'Ryan Thompson', prefix: 'TM' as const },
            { name: 'Grace Liu', prefix: 'TM' as const }
          ]
        }
      ],
      isActive: true,
      is_active: true,
      created_at: new Date().toISOString()
    }

    res.status(200).json({ meeting })

  } catch (error) {
    console.error('Server error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}