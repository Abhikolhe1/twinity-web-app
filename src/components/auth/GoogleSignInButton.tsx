'use client'

import { useGoogleLogin } from '@react-oauth/google'
import { Loader2, Shield, Building2, User, X } from 'lucide-react'
import { useState } from 'react'

interface Props {
  onSuccess: (accessToken: string, accountType: string) => Promise<void>
  label?: string
}

export function GoogleSignInButton({ onSuccess, label = 'Continue with Google' }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'individual' | 'agency' | null>(null)

  const triggerLogin = useGoogleLogin({
    onSuccess: async (res) => {
      if (!selectedRole) {
        setError('Account type selection is required')
        return
      }
      setLoading(true)
      setError('')
      try {
        await onSuccess(res.access_token, selectedRole)
        setShowModal(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Google sign-in failed')
      } finally {
        setLoading(false)
      }
    },
    onError: () => setError('Google sign-in was cancelled or failed'),
  })

  const handleCardSelect = (role: 'individual' | 'agency') => {
    setSelectedRole(role)
  }

  const handleConfirmRole = () => {
    if (selectedRole) {
      triggerLogin()
    }
  }

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <button
        type="button"
        onClick={() => {
          setSelectedRole(null)
          setError('')
          setShowModal(true)
        }}
        disabled={loading}
        className="flex h-10 w-full items-center justify-center gap-2.5 rounded-lg text-[14px] font-medium transition-all duration-150 disabled:opacity-60"
        style={{
          background: '#FFFFFF',
          border:     '1px solid rgba(0,0,0,0.12)',
          color:      'rgba(15,10,30,0.75)',
          boxShadow:  '0 1px 3px rgba(0,0,0,0.06)',
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            (e.currentTarget as HTMLButtonElement).style.background = '#F8F6FF'
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(124,58,237,0.30)'
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF'
          ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,0,0,0.12)'
        }}
      >
        {loading ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <>
            <GoogleIcon />
            {label}
          </>
        )}
      </button>

      {error && !showModal && (
        <p className="text-center text-[12px]" style={{ color: '#DC2626' }}>{error}</p>
      )}

      {/* Role Selection Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="relative w-full max-w-[420px] rounded-2xl p-6 shadow-2xl animate-fade-in"
            style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)' }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-lg hover:bg-black/[0.05]"
              style={{ color: 'rgba(15,10,30,0.38)' }}
              aria-label="Close dialog"
            >
              <X size={16} />
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#7C3AED]/10 text-[#7C3AED] mb-4">
                <Shield size={20} />
              </div>
              <h3 className="font-display text-[20px] font-bold text-[#0F0A1E] tracking-tight">
                Account Registration Role
              </h3>
              <p className="mt-1 text-[13px] text-black/50" style={{ lineHeight: 1.4 }}>
                Choose your registration profile type to proceed with Google auth.
              </p>
            </div>

            {error && (
              <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-600 ring-1 ring-red-500/20">{error}</p>
            )}

            {/* Choice Cards */}
            <div className="space-y-3 mb-6">
              {/* Individual Card */}
              <button
                type="button"
                onClick={() => handleCardSelect('individual')}
                className="flex w-full items-start gap-4 rounded-xl p-4 text-left transition-all border outline-none"
                style={{
                  background: selectedRole === 'individual' ? 'rgba(124,58,237,0.04)' : '#FFFFFF',
                  borderColor: selectedRole === 'individual' ? '#7C3AED' : 'rgba(0,0,0,0.08)',
                  boxShadow: selectedRole === 'individual' ? '0 0 12px rgba(124,58,237,0.12)' : 'none'
                }}
              >
                <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${selectedRole === 'individual' ? 'bg-[#7C3AED]/20 text-[#7C3AED]' : 'bg-black/[0.04] text-black/40'}`}>
                  <User size={16} />
                </div>
                <div>
                  <h4 className="text-[13.5px] font-bold text-[#0F0A1E]">Individual Profile</h4>
                  <p className="mt-0.5 text-[12px] text-black/40" style={{ lineHeight: 1.3 }}>
                    Register for personal greetings and lighter influencer packages.
                  </p>
                </div>
              </button>

              {/* Business Card */}
              <button
                type="button"
                onClick={() => handleCardSelect('agency')}
                className="flex w-full items-start gap-4 rounded-xl p-4 text-left transition-all border outline-none"
                style={{
                  background: selectedRole === 'agency' ? 'rgba(124,58,237,0.04)' : '#FFFFFF',
                  borderColor: selectedRole === 'agency' ? '#7C3AED' : 'rgba(0,0,0,0.08)',
                  boxShadow: selectedRole === 'agency' ? '0 0 12px rgba(124,58,237,0.12)' : 'none'
                }}
              >
                <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${selectedRole === 'agency' ? 'bg-[#7C3AED]/20 text-[#7C3AED]' : 'bg-black/[0.04] text-black/40'}`}>
                  <Building2 size={16} />
                </div>
                <div>
                  <h4 className="text-[13.5px] font-bold text-[#0F0A1E]">Business Profile</h4>
                  <p className="mt-0.5 text-[12px] text-black/40" style={{ lineHeight: 1.3 }}>
                    Register your company details to Clear Rights and configure licensed B2B ad campaigns.
                  </p>
                </div>
              </button>
            </div>

            {/* Confirm Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-lg border border-black/10 py-2.5 text-center text-xs font-semibold text-black/60 hover:bg-black/[0.02]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRole}
                disabled={!selectedRole}
                className="flex-1 rounded-lg bg-[#7C3AED] py-2.5 text-center text-xs font-semibold text-white hover:bg-[#6D28D9] disabled:opacity-50 disabled:pointer-events-none"
                style={{ boxShadow: '0 1px 3px rgba(124,58,237,0.30)' }}
              >
                Continue Auth
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}
