// Public registration disabled
// This endpoint intentionally returns 403 to prevent public user creation.
import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(403).json({ error: 'Registration disabled. Please contact the administrator to create user accounts.' })
}