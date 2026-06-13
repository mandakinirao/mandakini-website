import { defineField, defineType } from 'sanity'

// PHASE 2 — Schema defined now so data structure is ready. No UI built yet.
export const memberSchema = defineType({
  name: 'member',
  title: 'Member',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string' }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({ name: 'enrolledClasses', title: 'Enrolled Classes', type: 'array', of: [{ type: 'reference', to: [{ type: 'class' }] }] }),
    defineField({ name: 'accountStatus', title: 'Account Status', type: 'string', options: { list: ['active', 'suspended'], layout: 'radio' }, initialValue: 'active' }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'email' },
  },
})
