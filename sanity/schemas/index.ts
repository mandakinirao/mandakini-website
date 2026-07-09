import type { SchemaTypeDefinition } from 'sanity'
import { homepageSchema } from './homepage'
import { aboutSchema } from './about'
import { projectSchema } from './project'
import { shopItemSchema } from './shopItem'
import { orderSchema } from './order'
import { pressItemSchema } from './pressItem'
import { siteSettingsSchema } from './siteSettings'
import { classSchema } from './class'
import { memberSchema } from './member'
import { enquirySchema } from './enquiry'
import { testimonialSchema } from './testimonial'
import { journalSectionSchema } from './journalSection'
import { journalPostSchema } from './journalPost'

export const schemaTypes = [
  homepageSchema,
  aboutSchema,
  siteSettingsSchema,
  projectSchema,
  shopItemSchema,
  orderSchema,
  pressItemSchema,
  testimonialSchema,
  enquirySchema,
  classSchema,
  memberSchema,
  journalSectionSchema,
  journalPostSchema,
] as unknown as SchemaTypeDefinition[]
