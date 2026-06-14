import type { SchemaTypeDefinition } from 'sanity'
import { projectSchema } from './project'
import { artworkSchema } from './artwork'
import { shopItemSchema } from './shopItem'
import { orderSchema } from './order'
import { pressItemSchema } from './pressItem'
import { aboutSchema } from './about'
import { siteSettingsSchema } from './siteSettings'
import { navigationSchema } from './navigation'
import { classSchema } from './class'
import { memberSchema } from './member'
import { enquirySchema } from './enquiry'
import { testimonialSchema } from './testimonial'

export const schemaTypes = [
  projectSchema,
  artworkSchema,
  shopItemSchema,
  orderSchema,
  pressItemSchema,
  aboutSchema,
  siteSettingsSchema,
  navigationSchema,
  classSchema,
  memberSchema,
  enquirySchema,
  testimonialSchema,
] as unknown as SchemaTypeDefinition[]
