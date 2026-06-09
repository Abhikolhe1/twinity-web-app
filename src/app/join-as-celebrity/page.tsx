import Link from 'next/link'
import { ArrowRight, BadgeCheck, LockKeyhole, ShieldCheck, Sparkles, Star, UserCheck, WalletCards } from 'lucide-react'

const TRUST_ITEMS = [
  'Private onboarding',
  'Approval-led access',
  'Dedicated celebrity workspace',
]

const VALUE_POINTS = [
  {
    Icon: ShieldCheck,
    title: 'Protected access',
    text: 'Only approved celebrity accounts receive portal access, keeping onboarding controlled and secure.',
  },
  {
    Icon: WalletCards,
    title: 'Professional presence',
    text: 'Complete your public profile, media details, and portal-ready information in one guided flow.',
  },
  {
    Icon: Star,
    title: 'Managed workflow',
    text: 'Stay aligned with Twinity-approved work, profile updates, and future celebrity-side actions.',
  },
]

const JOURNEY = [
  {
    step: '01',
    title: 'Apply with the essentials',
    text: 'Share a short introduction, your email, region, nationality, and industry details.',
  },
  {
    step: '02',
    title: 'Wait for review',
    text: 'Our super-admin team reviews each request before any portal access is enabled.',
  },
  {
    step: '03',
    title: 'Receive your access email',
    text: 'Approved celebrities receive the login URL, email, and temporary password.',
  },
  {
    step: '04',
    title: 'Complete your profile',
    text: 'Your first login guides you through profile completion before the full portal unlocks.',
  },
]

export default function JoinAsCelebrityPage() {
  return (
    <div
      className="min-h-screen text-[#0F0A1E]"
      style={{
        background: 'linear-gradient(180deg, #fffdfa 0%, #ffffff 36%, #fffaf3 100%)',
      }}
    >
      <section className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div
          className="overflow-hidden rounded-[36px] border border-[rgba(15,10,30,0.08)]"
          style={{
            background:
              'radial-gradient(520px 260px at 92% 12%, rgba(124,58,237,0.12), transparent 72%), radial-gradient(420px 220px at 10% 90%, rgba(251,191,36,0.10), transparent 70%), linear-gradient(135deg, #fffefc 0%, #ffffff 55%, #faf5ff 100%)',
            boxShadow: '0 28px 70px rgba(15,10,30,0.08)',
          }}
        >
          <div className="px-5 py-7 sm:px-8 sm:py-9 lg:px-12 lg:py-12">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[rgba(124,58,237,0.1)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#6D28D9]">
                  Celebrity Portal
                </span>
                {/* {TRUST_ITEMS.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[rgba(15,10,30,0.08)] bg-white/80 px-3 py-1 text-[11px] font-medium text-[rgba(15,10,30,0.6)]"
                  >
                    {item}
                  </span>
                ))} */}
              </div>

              <h1 className="mt-6 max-w-[900px] text-[clamp(32px,4.2vw,56px)] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#211A37]">
                Join Twinity As A Celebrity Partner.
              </h1>

              <p className="mt-6 max-w-[610px] text-[17px] leading-8 text-[rgba(15,10,30,0.7)]">
                Twinity gives approved talent a dedicated portal to complete onboarding, manage profile presence, and stay connected to platform-approved work in a secure, structured way.
              </p>
              <div className="mt-10 flex">
                <Link
                  href="/join-as-celebrity/apply"
                  className="inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
                  style={{
                    background: 'linear-gradient(135deg,#7C3AED,#5B21B6)',
                    boxShadow: '0 18px 38px -18px rgba(124,58,237,0.65)',
                  }}
                >
                  Join As Celebrity
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {VALUE_POINTS.map(({ Icon, title, text }) => (
                  <div
                    key={title}
                    className="rounded-[24px] border border-[rgba(15,10,30,0.08)] bg-white/88 p-5"
                    style={{ boxShadow: '0 14px 30px rgba(15,10,30,0.05)' }}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(124,58,237,0.1)] text-[#6D28D9]">
                      <Icon size={18} />
                    </div>
                    <p className="mt-4 text-[15px] font-bold text-[#0F0A1E]">{title}</p>
                    <p className="mt-2 text-[13px] leading-6 text-[rgba(15,10,30,0.58)]">{text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-4 text-[12.5px] text-[rgba(15,10,30,0.54)]">
                <span className="inline-flex items-center gap-2">
                  <BadgeCheck size={15} className="text-[#16A34A]" />
                  Approval required before access
                </span>
                <span className="inline-flex items-center gap-2">
                  <LockKeyhole size={15} className="text-[#D97706]" />
                  First login unlocks only after profile completion
                </span>
              </div>
            </div>

            <div className="mt-10 border-t border-[rgba(15,10,30,0.08)] pt-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#6D28D9]">How It Works</p>
                  <h2 className="mt-2 text-[28px] font-bold tracking-[-0.03em] text-[#0F0A1E]">
                    A guided path into the portal.
                  </h2>
                  <p className="mt-3 max-w-[720px] text-[14px] leading-7 text-[rgba(15,10,30,0.58)]">
                    We keep the celebrity onboarding experience simple at the start, then unlock the full workspace only after approval and profile completion.
                  </p>
                </div>
                <div className="hidden rounded-2xl bg-[rgba(124,58,237,0.1)] p-3 text-[#6D28D9] md:block">
                  <Sparkles size={18} />
                </div>
              </div>

              <div className="mt-7 grid gap-4 lg:grid-cols-2">
                {JOURNEY.map((item) => (
                  <div
                    key={item.step}
                    className="rounded-[24px] border border-[rgba(15,10,30,0.07)] bg-white px-5 py-5"
                    style={{ boxShadow: '0 10px 22px rgba(15,10,30,0.04)' }}
                  >
                    <div className="flex items-start gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#7C3AED] text-[12px] font-bold text-white">
                        {item.step}
                      </span>
                      <div>
                        <p className="text-[15px] font-bold text-[#0F0A1E]">{item.title}</p>
                        <p className="mt-2 text-[13.5px] leading-6 text-[rgba(15,10,30,0.58)]">{item.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {[
                  { Icon: ShieldCheck, label: 'Restricted access' },
                  { Icon: UserCheck, label: 'Human approval' },
                  { Icon: Sparkles, label: 'Profile-first unlock' },
                ].map(({ Icon, label }) => (
                  <div
                    key={label}
                    className="rounded-[22px] border border-[rgba(124,58,237,0.12)] bg-[rgba(124,58,237,0.05)] px-4 py-4"
                  >
                    <Icon size={16} className="text-[#6D28D9]" />
                    <p className="mt-2 text-sm font-semibold leading-6 text-[#0F0A1E]">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 flex">
              <Link
                href="/join-as-celebrity/apply"
                className="inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(135deg,#7C3AED,#5B21B6)',
                  boxShadow: '0 18px 38px -18px rgba(124,58,237,0.65)',
                }}
              >
                Join As Celebrity
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-6 pb-16 md:px-10 lg:px-12 lg:pb-20">
        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div
            className="rounded-[30px] border border-[rgba(15,10,30,0.08)] p-7"
            style={{ background: '#fffdf8', boxShadow: '0 18px 36px rgba(15,10,30,0.05)' }}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[rgba(15,10,30,0.42)]">Why this portal exists</p>
            <h3 className="mt-3 text-[28px] font-bold tracking-[-0.03em] text-[#0F0A1E]">
              Built for clarity, privacy, and controlled onboarding.
            </h3>
            <p className="mt-4 text-[14px] leading-7 text-[rgba(15,10,30,0.58)]">
              We do not open celebrity accounts instantly. Twinity uses a review-first approach so every portal account starts with the right profile, the right ownership, and the right access controls.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              'A short initial application instead of a long first form.',
              'A human approval step before any credentials are activated.',
              'A guided first login experience for completing the remaining profile.',
              'A dedicated route for celebrity access, separate from customer flows.',
            ].map((item) => (
              <div
                key={item}
                className="rounded-[26px] border border-[rgba(15,10,30,0.08)] bg-white p-5 text-[14px] leading-7 text-[rgba(15,10,30,0.62)]"
                style={{ boxShadow: '0 14px 30px rgba(15,10,30,0.04)' }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
