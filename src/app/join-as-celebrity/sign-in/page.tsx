import { redirect } from 'next/navigation'
import { ADMIN_PORTAL_URL } from '@/lib/api'

export default function CelebrityPortalSignInPage() {
  redirect(`${ADMIN_PORTAL_URL}/celebrity-login`)
}
