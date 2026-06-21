import type { SchemaTypeDefinition } from 'sanity'
import { projectSchema } from './project'
import { shopItemSchema } from './shopItem'
import { orderSchema } from './order'
import { pressItemSchema } from './pressItem'
import { aboutPageSchema } from './aboutPage'
import { siteSettingsSchema } from './siteSettings'
import { navigationSchema } from './navigation'
import { classSchema } from './class'
import { memberSchema } from './member'
import { enquirySchema } from './enquiry'
import { testimonialSchema } from './testimonial'

export const schemaTypes = [
  projectSchema,
  shopItemSchema,
  orderSchema,
  pressItemSchema,
  aboutPageSchema,
  siteSettingsSchema,
  navigationSchema,
  classSchema,
  memberSchema,
  enquirySchema,
  testimonialSchema,
] as unknown as SchemaTypeDefinition[]
