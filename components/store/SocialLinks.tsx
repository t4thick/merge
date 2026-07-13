import { SOCIAL_LINKS } from '@/lib/constants/social'
import { cn } from '@/lib/utils'

export function SocialLinks({ className }: { className?: string }) {
  if (SOCIAL_LINKS.length === 0) return null
  return (
    <ul className={cn('flex flex-wrap gap-2', className)}>
      {SOCIAL_LINKS.map((link) => (
        <li key={link.id}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center rounded-lg border border-earth-200 px-3 text-sm font-medium text-earth-700 no-underline transition-colors duration-150 hover:border-earth-300 hover:bg-earth-50 hover:text-brand-700"
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  )
}
