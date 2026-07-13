import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/40 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-brand-700 text-white shadow-[var(--shadow-elev)] hover:bg-brand-800 hover:shadow-[var(--shadow-card-hover)]',
        accent:
          'bg-accent-500 text-white shadow-[0_8px_24px_rgb(244_113_75_/_0.28)] hover:bg-accent-600 hover:shadow-[0_12px_32px_rgb(244_113_75_/_0.32)]',
        outline:
          'border border-earth-300 bg-white text-earth-800 hover:border-brand-500 hover:bg-sand hover:shadow-[var(--shadow-soft)]',
        ghost: 'text-earth-700 hover:bg-earth-100 hover:text-earth-900',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        link: 'text-brand-700 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  )
)
Button.displayName = 'Button'

export { buttonVariants }
