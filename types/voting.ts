// types/voting.ts
export interface Nominee {
  name: string;
  prefix: "TM" | "Guest";
  suffix?: string;
}

export interface VotingRole {
  id: string;
  name: string;
  nominees: Nominee[];
}

export interface Meeting {
  id: string;
  slug?: string;
  name: string;
  date: string;
  clubName: string;
  roles: VotingRole[];
  isActive: boolean;
  createdBy: string;
}

export interface Vote {
  id: string;
  meetingId: string;
  roleId: string;
  nominee: Nominee;
  voterId: string;
  timestamp: string;
}

export interface VoteResults {
  roleId: string;
  roleName: string;
  results: {
    nominee: Nominee;
    votes: number;
    percentage: number;
  }[];
  totalVotes: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  isAdmin?: boolean;
}