import Link from 'next/link'

interface PillCtaProps {
  href?: string
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  className?: string
  children: React.ReactNode
}

export default function PillCta({
  href,
  onClick,
  type = 'button',
  disabled,
  className,
  children,
}: PillCtaProps) {
  const cls = ['mr2-cta', className].filter(Boolean).join(' ')
  if (href) return <Link href={href} className={cls}>{children}</Link>
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}
