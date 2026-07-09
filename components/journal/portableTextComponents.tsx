import type { PortableTextComponents } from '@portabletext/react'

export const journalPortableTextComponents: PortableTextComponents = {
  marks: {
    link: ({ children, value }) => {
      const href: string = value?.href ?? '#'
      const external = /^https?:\/\//.test(href)
      return (
        <a
          href={href}
          className="mr-journal__link"
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {children}
        </a>
      )
    },
  },
  block: {
    normal: ({ children }) => <p>{children}</p>,
  },
}
