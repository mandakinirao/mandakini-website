import Link from 'next/link'
import ProjectForm from '@/components/admin/ProjectForm'

export default function NewProject() {
  return (
    <>
      <Link href="/admin/projects" className="mr-admin-back">← Projects</Link>
      <div className="mr-admin-head"><h1>Add a project</h1></div>
      <ProjectForm initial={{ name: '', year: '', description: '', showOnHomepage: false, photos: [] }} />
    </>
  )
}
