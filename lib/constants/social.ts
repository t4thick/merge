export type SocialLink = {
  id: 'tiktok' | 'facebook' | 'instagram'
  label: string
  href: string
}

function socialUrl(envKey: string, fallback: string): string {
  return process.env[envKey]?.trim() || fallback
}

/** Official Lovely Queen social profiles (override via NEXT_PUBLIC_SOCIAL_*). */
export const SOCIAL_LINKS: SocialLink[] = [
  {
    id: 'tiktok',
    label: 'TikTok',
    href: socialUrl('NEXT_PUBLIC_SOCIAL_TIKTOK_URL', 'https://www.tiktok.com/@lovelyqueen8855'),
  },
  {
    id: 'facebook',
    label: 'Facebook',
    href: socialUrl('NEXT_PUBLIC_SOCIAL_FACEBOOK_URL', 'https://www.facebook.com/100057288706241/'),
  },
  {
    id: 'instagram',
    label: 'Instagram',
    href: socialUrl(
      'NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL',
      'https://www.instagram.com/lovelyqueenafricanmarket/'
    ),
  },
]

export const SOCIAL_SAME_AS = SOCIAL_LINKS.map((link) => link.href)
