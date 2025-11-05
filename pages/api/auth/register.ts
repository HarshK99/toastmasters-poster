// API route for user registration
import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/database'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password, role = 'member' } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' })
    }

    // Validate role
    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({ error: 'Role must be either admin or member' })
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email.toLowerCase())
      .single()

    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' })
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password: hashedPassword,
        role
      })
      .select('id, email, role, created_at')
      .single()

    if (error) {
      console.error('Registration error:', error)
      return res.status(500).json({ error: 'Failed to create user account' })
    }

    res.status(201).json({ 
      user,
      message: 'User account created successfully'
    })

  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}