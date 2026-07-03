export interface SiteSettings {
  worksPageHeadline: string
  worksEmptyHeadline: string
  worksEmptyBody: string
  shopPageHeadline: string
  shopPrintNote: string
  printDefaultPaper: string
  printDefaultSignature: string
  printDefaultShipping: string
  thankYouMessage: string
  contactPageIntro: string
  contactEmail: string
  privateCollectionTitle: string
  privateCollectionLine: string
}

const DEFAULTS: SiteSettings = {
  worksPageHeadline: 'Bodies of work',
  worksEmptyHeadline: 'New work is on the easel',
  worksEmptyBody: 'No projects are published yet — the studio is busy. Check back soon.',
  shopPageHeadline: 'Signed editions from the Hyderabad studio',
  shopPrintNote: 'Each print is signed and numbered in the Hyderabad studio.',
  printDefaultPaper: '308gsm cotton rag, archival',
  printDefaultSignature: 'Signed & numbered by hand',
  printDefaultShipping: 'Rolled, worldwide from Hyderabad',
  thankYouMessage:
    'Your order is confirmed — a confirmation is on its way to your inbox, and a shipping note with the waybill number will follow once your print leaves the Hyderabad studio.',
  contactPageIntro: 'For enquiries about original works, commissions, workshops, or anything else — write to Mandakini directly.',
  contactEmail: 'mandakinirao@gmail.com',
  privateCollectionTitle: 'The Private Collection',
  privateCollectionLine:
    'A selection of original works shared personally with collectors. Enquire to receive the collection.',
}

function hasSanityEnv(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID)
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!hasSanityEnv()) return DEFAULTS

  try {
    const [{ client }, { siteSettingsShopQuery }] = await Promise.all([
      import('@/sanity/lib/client'),
      import('@/sanity/lib/queries'),
    ])

    const doc = await client.fetch<Partial<SiteSettings> | null>(siteSettingsShopQuery)
    if (!doc) return DEFAULTS

    return {
      worksPageHeadline: doc.worksPageHeadline ?? DEFAULTS.worksPageHeadline,
      worksEmptyHeadline: doc.worksEmptyHeadline ?? DEFAULTS.worksEmptyHeadline,
      worksEmptyBody: doc.worksEmptyBody ?? DEFAULTS.worksEmptyBody,
      shopPageHeadline: doc.shopPageHeadline ?? DEFAULTS.shopPageHeadline,
      shopPrintNote: doc.shopPrintNote ?? DEFAULTS.shopPrintNote,
      printDefaultPaper: doc.printDefaultPaper ?? DEFAULTS.printDefaultPaper,
      printDefaultSignature: doc.printDefaultSignature ?? DEFAULTS.printDefaultSignature,
      printDefaultShipping: doc.printDefaultShipping ?? DEFAULTS.printDefaultShipping,
      thankYouMessage: doc.thankYouMessage ?? DEFAULTS.thankYouMessage,
      contactPageIntro: doc.contactPageIntro ?? DEFAULTS.contactPageIntro,
      contactEmail: doc.contactEmail ?? DEFAULTS.contactEmail,
      privateCollectionTitle: doc.privateCollectionTitle ?? DEFAULTS.privateCollectionTitle,
      privateCollectionLine: doc.privateCollectionLine ?? DEFAULTS.privateCollectionLine,
    }
  } catch {
    return DEFAULTS
  }
}
