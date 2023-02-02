export interface Invitation {
    uuid?: string
    name?: string
    accepted?: boolean
    rideshare?: 1 | 2 | 3 | 4
    further_guests: string[]
    need_to_know?: string
    favourite_song?: string
  }