// API route for user login
import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/database'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Dummy admin bypass for testing
    if (email.toLowerCase() === 'admin@test.com' && password === 'admin123') {
      return res.status(200).json({ 
        user: {
          id: 'dummy-admin',
          email: 'admin@test.com',
          role: 'admin',
          created_at: new Date().toISOString()
        },
        message: 'Login successful (dummy admin)' 
      })
    }

    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Return user data (without password)
    const { password: _password, ...userWithoutPassword } = user
    
    res.status(200).json({ 
      user: userWithoutPassword,
      message: 'Login successful'
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}