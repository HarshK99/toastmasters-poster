// API route to get voting results
import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/database'

interface Role {
  id: string
  name: string
}

interface Vote {
  role_id: string
  nominee: {
    name: string
    prefix: string
  }
  voter_email: string
  voter_name: string
}

interface MeetingWithVotes {
  id: string
  name: string
  date: string
  club_name: string
  roles: Role[]
  votes: Vote[]
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { slug } = req.query

    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ error: 'Invalid slug' })
    }

    // Get meeting with votes
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select(`
        *,
        votes (
          role_id,
          nominee,
          voter_email,
          voter_name
        )
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single() as { data: MeetingWithVotes | null, error: unknown }

    if (meetingError || !meeting) {
      console.error('Meeting fetch error:', meetingError)
      return res.status(404).json({ error: 'Meeting not found' })
    }

    // Process votes into results format
    const results = meeting.roles.map((role: Role) => {
      const roleVotes = meeting.votes.filter((vote: Vote) => vote.role_id === role.id)

      const voteCount: { [key: string]: number } = {}
      roleVotes.forEach((vote: Vote) => {
        const nomineeKey = `${vote.nominee.prefix} ${vote.nominee.name}`
        voteCount[nomineeKey] = (voteCount[nomineeKey] || 0) + 1
      })

      // Sort nominees by vote count
      const sortedResults = Object.entries(voteCount)
        .map(([nominee, count]) => ({ nominee, count }))
        .sort((a, b) => b.count - a.count)

      return {
        roleId: role.id,
        roleName: role.name,
        totalVotes: roleVotes.length,
        results: sortedResults,
        voters: roleVotes.map((vote: Vote) => ({
          name: vote.voter_name,
          email: vote.voter_email
        }))
      }
    })

    res.status(200).json({
      meeting: {
        name: meeting.name,
        date: meeting.date,
        clubName: meeting.club_name
      },
      results
    })

  } catch (error) {
    console.error('Server error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
