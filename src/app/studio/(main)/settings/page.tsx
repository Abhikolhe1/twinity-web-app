'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Building2, Phone, Mail, CheckCircle2, ShieldAlert, Loader2, Save, ArrowRight } from 'lucide-react'
import { authApi, getToken } from '@/lib/api'
import { useUser } from '@/contexts/UserContext'

export default function SettingsPage() {
  const router = useRouter()
  const { user, login } = useUser()

  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [crNumber, setCrNumber] = useState('')

  // UI States
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [activeTab, setActiveTab] = useState<'profile' | 'business'>('profile')

  // Set initial states from user context
  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setEmail(user.email || '')
      setPhone(user.phone || '')
      
      // Parse company name and CR number if business
      if (user.account_type === 'agency' && user.company) {
        if (user.company.includes(' | CR: ')) {
          const parts = user.company.split(' | CR: ')
          setCompany(parts[0] || '')
          setCrNumber(parts[1] || '')
        } else {
          setCompany(user.company)
          setCrNumber('')
        }
      } else {
        setCompany(user.company || '')
        setCrNumber('')
      }
    }
  }, [user])

  if (!user) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#7C3AED]" />
      </div>
    )
  }

  const isBusiness = user.account_type === 'agency'

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSuccessMsg('')
    setErrorMsg('')

    try {
      let companyVal = company
      if (isBusiness && crNumber.trim()) {
        companyVal = `${company.trim()} | CR: ${crNumber.trim()}`
      }

      const res = await authApi.updateProfile({
        name: name.trim(),
        phone: phone.trim() || undefined,
        company: isBusiness ? companyVal.trim() : ''
      })

      // Update global context & local storage
      const currentToken = getToken() || ''
      login(currentToken, res.user)

      setSuccessMsg('Account details saved successfully!')
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update account. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-[800px] px-6 py-10 md:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-[32px] font-extrabold tracking-tight" style={{ color: "#0F0A1E", lineHeight: 1.1 }}>
          Account Settings
        </h1>
        <p className="mt-2 text-[14.5px]" style={{ color: "rgba(15,10,30,0.50)" }}>
          Manage your account profile, role types, and business details.
        </p>
      </div>

      {/* Tabs */}
      {isBusiness && (
        <div className="mb-8 flex gap-2 border-b border-black/[0.06] pb-px animate-fade-in">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className="relative flex items-center gap-2 pb-3 text-[14px] font-semibold transition-all"
            style={{
              color: activeTab === 'profile' ? '#7C3AED' : 'rgba(15,10,30,0.40)',
            }}
          >
            <User size={15} />
            Personal Profile
            {activeTab === 'profile' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C3AED] rounded-full animate-scale-x" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('business')}
            className="relative flex items-center gap-2 pb-3 text-[14px] font-semibold transition-all"
            style={{
              color: activeTab === 'business' ? '#7C3AED' : 'rgba(15,10,30,0.40)',
            }}
          >
            <Building2 size={15} />
            Business Details
            {activeTab === 'business' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C3AED] rounded-full animate-scale-x" />
            )}
          </button>
        </div>
      )}

      {/* Alert Notices */}
      {successMsg && (
        <div className="mb-6 flex items-center gap-2.5 rounded-xl px-4 py-3 text-[13.5px] font-medium transition-all duration-300"
          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.20)', color: '#059669' }}>
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 flex items-center gap-2.5 rounded-xl px-4 py-3 text-[13.5px] font-medium"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.20)', color: '#DC2626' }}>
          <ShieldAlert size={16} />
          {errorMsg}
        </div>
      )}

      {/* Profile forms */}
      <div className="rounded-2xl border border-black/[0.07] bg-white p-6 shadow-sm md:p-8">
        <form onSubmit={handleSaveProfile} className="space-y-6">
          
          {activeTab === 'profile' ? (
            <div className="space-y-5">
              <div className="flex items-center gap-3 border-b border-black/[0.04] pb-4">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#7C3AED]/10 text-[#7C3AED]">
                  <User size={18} />
                </div>
                <div>
                  <h3 className="text-[15.5px] font-bold" style={{ color: '#0F0A1E' }}>Personal Information</h3>
                  <p className="text-[11.5px]" style={{ color: 'rgba(15,10,30,0.40)' }}>Manage your client details</p>
                </div>
                <span className="ms-auto rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em]"
                  style={{
                    background: isBusiness ? 'rgba(124,58,237,0.08)' : 'rgba(0,0,0,0.04)',
                    color: isBusiness ? '#7C3AED' : 'rgba(15,10,30,0.50)',
                    border: isBusiness ? '1px solid rgba(124,58,237,0.18)' : '1px solid rgba(0,0,0,0.08)'
                  }}>
                  {isBusiness ? 'Business / Agency' : 'Individual Account'}
                </span>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold" style={{ color: "rgba(15,10,30,0.50)" }}>Full Name</span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-black/[0.09] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#7C3AED]/50 focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                    style={{ color: '#0F0A1E' }}
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-semibold" style={{ color: "rgba(15,10,30,0.50)" }}>Email Address</span>
                  <div className="relative mt-1.5">
                    <input
                      type="email"
                      readOnly
                      disabled
                      value={email}
                      className="w-full rounded-lg border border-black/[0.08] bg-[#FAFAFA] pl-3.5 pr-10 py-2.5 text-sm cursor-not-allowed"
                      style={{ color: 'rgba(15,10,30,0.45)' }}
                    />
                    <Mail size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black/20" />
                  </div>
                </label>

                <label className="block">
                  <span className="text-xs font-semibold" style={{ color: "rgba(15,10,30,0.50)" }}>Contact Phone Number</span>
                  <div className="relative mt-1.5">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+966 5X XXX XXXX"
                      className="w-full rounded-lg border border-black/[0.09] bg-white pl-9 pr-3.5 py-2.5 text-sm outline-none focus:border-[#7C3AED]/50 focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                      style={{ color: '#0F0A1E' }}
                    />
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" />
                  </div>
                </label>

                <div className="block">
                  <span className="text-xs font-semibold block mb-1.5" style={{ color: "rgba(15,10,30,0.50)" }}>Account Type / Role</span>
                  <div className="inline-flex items-center gap-1.5 rounded-lg border border-black/[0.08] bg-black/[0.02] px-3.5 h-10 text-sm font-semibold" style={{ color: '#0F0A1E' }}>
                    {isBusiness ? 'Business / Agency Account' : 'Individual Account'}
                  </div>
                  <p className="mt-1 text-[11px]" style={{ color: "rgba(15,10,30,0.30)" }}>Role is managed at Google / Form authentication</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center gap-3 border-b border-black/[0.04] pb-4">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[#7C3AED]/10 text-[#7C3AED]">
                  <Building2 size={18} />
                </div>
                <div>
                  <h3 className="text-[15.5px] font-bold" style={{ color: '#0F0A1E' }}>Business Information</h3>
                  <p className="text-[11.5px]" style={{ color: 'rgba(15,10,30,0.40)' }}>Complete your organization details for verification</p>
                </div>
              </div>

              {(!company.trim() || !crNumber.trim()) && (
                <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-[13px] leading-relaxed"
                  style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.20)', color: '#D97706' }}>
                  <ShieldAlert size={16} className="mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold">Business verification pending:</span> Please fill in all fields below. Our compliance team will review and approve your business status within 24 hours.
                  </div>
                </div>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold" style={{ color: "rgba(15,10,30,0.50)" }}>Company Registered Name</span>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Twinity Advertising Ltd."
                    className="mt-1.5 w-full rounded-lg border border-black/[0.09] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#7C3AED]/50 focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                    style={{ color: '#0F0A1E' }}
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-semibold" style={{ color: "rgba(15,10,30,0.50)" }}>Commercial Registration (CR) / Unified ID</span>
                  <input
                    type="text"
                    required
                    value={crNumber}
                    onChange={(e) => setCrNumber(e.target.value)}
                    placeholder="e.g. 1010XXXXXX"
                    className="mt-1.5 w-full rounded-lg border border-black/[0.09] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[#7C3AED]/50 focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                    style={{ color: '#0F0A1E' }}
                  />
                </label>
              </div>
            </div>
          )}

          {/* Submit button */}
          <div className="flex items-center justify-between border-t border-black/[0.05] pt-5">
            {isBusiness && activeTab === 'profile' ? (
              <button
                type="button"
                onClick={() => setActiveTab('business')}
                className="flex items-center gap-1.5 text-[13px] font-semibold text-[#7C3AED] hover:text-[#6D28D9]"
              >
                Go to Business Details <ArrowRight size={13} />
              </button>
            ) : (
              <div />
            )}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#7C3AED] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#6D28D9] disabled:opacity-60 transition-all"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}
            >
              {saving ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={15} />
                  Save Changes
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
