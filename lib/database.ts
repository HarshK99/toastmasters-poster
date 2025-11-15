// Database configuration and client setup
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Create Supabase client (will be mocked for development)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface DatabaseMeeting {
  id: string
  slug: string
  name: string
  date: string
  club_name: string
  created_by: string
  is_active: boolean
  roles: Array<{
    id: string
    name: string
    nominees: Array<{
      name: string
      prefix: string
      suffix?: string
    }>
  }>
  created_at: string
  updated_at: string
}

export interface DatabaseVote {
  id: string
  meeting_id: string
  role_id: string
  nominee: {
    name: string
    prefix: string
    suffix?: string
  }
  created_at: string
}

// Utility functions
export const generateSlug = (meetingName: string, clubName: string): string => {
  const slug = `${meetingName}-${clubName}`
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
  
  // Add random suffix to ensure uniqueness
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  return `${slug}-${randomSuffix}`
}

export const isValidSlug = (slug: string): boolean => {
  return /^[a-z0-9-]+$/.test(slug) && slug.length >= 3 && slug.length <= 100
}