import { SignUp } from '@clerk/clerk-react'
import { useRive, useStateMachineInput } from '@rive-app/react-canvas'
import { useEffect, useRef, useState, useCallback, memo } from 'react'

/* ─── Constants ────────────────────────────────────────────────────────────── */
const DARK = '#05050f'
const STATE_MACHINE = 'Login Machine'

/* ─── Font injection ───────────────────────────────────────────────────────── */
const FONT_URL = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'

/* ─── useMediaQuery hook ───────────────────────────────────────────────────── */
function useIsMobile(breakpoint = 768) {
    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
    )
    useEffect(() => {
        const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
        setIsMobile(mq.matches)
        mq.addEventListener('change', handler)
        return () => mq.removeEventListener('change', handler)
    }, [breakpoint])
    return isMobile
}

/* ─── Rive Teddy (memoized) ────────────────────────────────────────────────── */
const TeddyRive = memo(function TeddyRive({
    isTyping,
    isChecking,
}: {
    isTyping: boolean
    isChecking: boolean
}) {
    const { RiveComponent, rive } = useRive({
        src: '/login-teddy.riv',
        stateMachines: STATE_MACHINE,
        autoplay: true,
        isTouchScrollEnabled: false,
    })

    const isHandsUpInput  = useStateMachineInput(rive, STATE_MACHINE, 'isHandsUp')
    const isCheckingInput = useStateMachineInput(rive, STATE_MACHINE, 'isChecking')

    useEffect(() => { if (isHandsUpInput)  isHandsUpInput.value  = isTyping   }, [isTyping,   isHandsUpInput])
    useEffect(() => { if (isCheckingInput) isCheckingInput.value = isChecking  }, [isChecking, isCheckingInput])

    return (
        <RiveComponent
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                display: 'block',
                // Force dark background through the canvas
                background: DARK,
            }}
        />
    )
})

/* ─── Gradient overlay helper ─────────────────────────────────────────────── */
function Overlay({ style }: { style: React.CSSProperties }) {
    return <div style={{ position: 'absolute', pointerEvents: 'none', zIndex: 2, ...style }} />
}

/* ── Clerk appearance (shared) ── */
const MemoizedSignUp = memo(function MemoizedSignUpWrapper(props: React.ComponentProps<typeof SignUp>) {
    return <SignUp {...props} />
});

const clerkAppearance = {
    variables: {
        colorPrimary: '#6366f1',
        colorBackground: '#0d0d1a',
        colorText: 'white',
        colorTextSecondary: 'rgba(255,255,255,0.4)',
        colorInputBackground: 'rgba(255,255,255,0.02)',
        colorInputText: 'white',
        borderRadius: '12px',
        fontFamily: "'Inter', system-ui, sans-serif",
    },
    elements: {
        rootBox: 'w-full',
        card: 'bg-[#0d0d1a] border border-white/10 shadow-2xl rounded-3xl p-6 sm:p-10',
        headerTitle: 'block text-white text-2xl font-bold font-inter',
        headerSubtitle: 'block text-white/40 text-sm font-inter',
        formButtonPrimary: 'bg-white text-black hover:bg-white/90 font-bold uppercase tracking-widest text-[11px] h-12 rounded-xl transition-all active:scale-95 shadow-lg shadow-white/5',
        socialButtonsBlockButton: 'bg-white/[0.03] border-white/[0.05] hover:bg-white/[0.08] text-white rounded-xl h-12 font-bold uppercase tracking-widest text-[10px] transition-all',
        socialButtonsBlockButtonText: 'text-white font-bold',
        formFieldLabel: 'text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2',
        formFieldInput: 'bg-white/[0.03] border-white/[0.05] text-white rounded-xl h-12 focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all px-4',
        footerActionText: 'text-white/40 font-bold uppercase tracking-widest text-[9px]',
        footerActionLink: 'text-blue-500 hover:text-blue-400 font-extrabold transition-colors ml-1',
        dividerRow: 'opacity-20',
        dividerText: 'text-[9px] font-black uppercase tracking-[0.3em] text-white/20',
        footer: 'bg-transparent pt-0',
        identityPreviewText: 'text-white',
        identityPreviewEditButtonIcon: 'text-white',
        alternativeMethodsBlockButton: 'text-white font-bold',
        otpCodeFieldInput: 'bg-white/[0.03] border-white/[0.05] text-white rounded-xl h-12 focus:ring-blue-500/50',
        formResendCodeLink: 'text-blue-500 font-bold',
        clButton: 'text-white',
    }
}

/* ─── Main Page ───────────────────────────────────────────────────────────── */
export default function SignUpPage() {
    const isMobile = useIsMobile()
    const [isTypingPassword, setIsTypingPassword] = useState(false)
    const [isChecking,       setIsChecking]       = useState(false)
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const handlePasswordFocus = useCallback(() => { setIsTypingPassword(true);  setIsChecking(false)  }, [])
    const handlePasswordBlur  = useCallback(() => { setIsTypingPassword(false)                        }, [])
    const handleEmailFocus    = useCallback(() => { setIsChecking(true); setIsTypingPassword(false)   }, [])
    const handleEmailBlur     = useCallback(() => { setIsChecking(false)                              }, [])

    useEffect(() => {
        // Lock horizontal scroll on html+body for this page
        const html = document.documentElement
        const body = document.body
        html.style.overflowX = 'hidden'
        body.style.overflowX = 'hidden'

        // Inject Google Fonts
        if (!document.getElementById('signup-fonts')) {
            const link = document.createElement('link')
            link.id = 'signup-fonts'
            link.rel = 'stylesheet'
            link.href = FONT_URL
            document.head.appendChild(link)
        }

        const attach = () => {
            document.querySelectorAll('input[type="password"]').forEach(el => {
                el.addEventListener('focus', handlePasswordFocus)
                el.addEventListener('blur',  handlePasswordBlur)
            })
            document.querySelectorAll('input[type="email"]').forEach(el => {
                el.addEventListener('focus', handleEmailFocus)
                el.addEventListener('blur',  handleEmailBlur)
            })
        }
        intervalRef.current = setInterval(() => {
            if (document.querySelectorAll('input[type="email"], input[type="password"]').length > 0) {
                attach()
                clearInterval(intervalRef.current!)
            }
        }, 400)
        return () => {
            html.style.overflowX = ''
            body.style.overflowX = ''
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [handlePasswordFocus, handlePasswordBlur, handleEmailFocus, handleEmailBlur])

    const hint = isTypingPassword
        ? '🙈 Keeping your password safe...'
        : isChecking
        ? '👀 Looking your details over...'
        : 'Your AI-powered growth engine'

    /* ── Clerk appearance (shared) ── */
    const clerkAppearance = {
        variables: {
            colorPrimary: '#6366f1',
            colorBackground: '#0d0d1a',
            colorText: 'white',
            colorTextSecondary: 'rgba(255,255,255,0.4)',
            colorInputBackground: 'rgba(255,255,255,0.04)',
            colorInputText: 'white',
            colorNeutral: 'rgba(255,255,255,0.1)',
            borderRadius: '14px',
            fontFamily: "'Inter', system-ui, sans-serif",
        },
        elements: {
            rootBox: { width: '100%', maxWidth: '100%', boxSizing: 'border-box' as const },

            headerTitle:    { display: 'block', color: 'white', fontSize: '28px', fontWeight: 800, fontFamily: "'Inter', sans-serif" },
            headerSubtitle: { display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontFamily: "'Inter', sans-serif" },
            socialButtonsBlockButton: {
                background: 'rgba(255,255,255,0.05)',
                border:     '1px solid rgba(255,255,255,0.08)',
                color:      'white',
                borderRadius: '12px',
                height:     '46px',
                fontWeight:  700,
                fontSize:   '13px',
                fontFamily: "'Inter', sans-serif",
            },
            formButtonPrimary: {
                background:  'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
                color:       'white',
                fontWeight:   700,
                fontSize:   '14px',
                fontFamily: "'Inter', sans-serif",
                letterSpacing: '0.04em',
                height:     '46px',
                borderRadius: '12px',
                border:      'none',
                boxShadow:   '0 8px 24px rgba(99,102,241,0.35)',
            },
            formFieldLabel: {
                fontSize:     '11px',
                fontWeight:    700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase' as const,
                color:        'rgba(255,255,255,0.35)',
                marginBottom:  '4px',
                fontFamily: "'Inter', sans-serif",
            },
            formFieldInput: {
                background:  'rgba(255,255,255,0.04)',
                border:      '1px solid rgba(255,255,255,0.08)',
                color:       'white',
                borderRadius:'12px',
                height:      '46px',
                fontSize:    '14px',
                padding:     '0 14px',
                fontFamily: "'Inter', sans-serif",
            },
            footerActionText: {
                color:        'rgba(255,255,255,0.3)',
                fontWeight:    600,
                fontSize:     '13px',
                fontFamily: "'Inter', sans-serif",
            },
            footerActionLink:   { color: '#818cf8', fontWeight: 700, marginLeft: '4px' },
            dividerRow:         { opacity: '0.15' },
            dividerText:        { fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const },
            footer:             { background: 'transparent', paddingTop: 0 },
            identityPreviewText:{ color: 'white' },
            identityPreviewEditButtonIcon: { color: 'white' },
            alternativeMethodsBlockButton: { color: 'white', fontWeight: 700 },
            otpCodeFieldInput: {
                background:  'rgba(255,255,255,0.04)',
                border:      '1px solid rgba(255,255,255,0.08)',
                color:       'white',
                borderRadius:'12px',
                height:      '46px',
            },
            formResendCodeLink: { color: '#818cf8', fontWeight: 700 },
            internal__footer:   { display: 'none' },
        },
    }

    /* ═══════════════════════════════════════════════════════════════════════
       MOBILE LAYOUT — stacked vertically
       ═══════════════════════════════════════════════════════════════════════ */
    if (isMobile) {
        return (
            <>
                {/* Force Clerk internals to not overflow on mobile */}
                <style>{`
                    .cl-rootBox, .cl-card, .cl-cardBox, .cl-main,
                    .cl-form, .cl-socialButtons, .cl-formFields {
                        max-width: 100% !important;
                        width: 100% !important;
                        box-sizing: border-box !important;
                        min-width: 0 !important;
                    }
                    .cl-formField { min-width: 0 !important; flex: 1 1 auto !important; }
                    .cl-formFieldInput { width: 100% !important; box-sizing: border-box !important; }
                `}</style>
                <div style={{
                    minHeight: '100dvh',
                    width: '100vw',
                    maxWidth: '100vw',
                    background: DARK,
                    display: 'flex',
                    flexDirection: 'column',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    overflowX: 'hidden',
                    boxSizing: 'border-box',
                }}>
                {/* ── TOP: Rive panel (fixed height) ── */}
                <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '300px',
                    flexShrink: 0,
                    overflow: 'hidden',
                    background: DARK,
                }}>
                    <TeddyRive isTyping={isTypingPassword} isChecking={isChecking} />

                    {/* Dark overlay on top of white canvas background */}
                    <div style={{
                        position: 'absolute', inset: 0, zIndex: 1,
                        background: `radial-gradient(ellipse at center, transparent 35%, ${DARK} 80%)`,
                        pointerEvents: 'none',
                    }} />

                    {/* Blend overlays */}
                    <Overlay style={{ top: 0, left: 0, right: 0, height: '50%', background: `linear-gradient(to bottom, ${DARK} 0%, ${DARK}99 30%, transparent 100%)`, zIndex: 3 }} />
                    <Overlay style={{ bottom: 0, left: 0, right: 0, height: '55%', background: `linear-gradient(to top, ${DARK} 0%, ${DARK}cc 35%, transparent 100%)`, zIndex: 3 }} />
                    <Overlay style={{ top: 0, left: 0, bottom: 0, width: '20%', background: `linear-gradient(to right, ${DARK}, transparent)`, zIndex: 3 }} />
                    <Overlay style={{ top: 0, right: 0, bottom: 0, width: '20%', background: `linear-gradient(to left, ${DARK}, transparent)`, zIndex: 3 }} />

                    {/* Hint — floats at bottom */}
                    <p style={{
                        position: 'absolute', bottom: '10px', left: 0, right: 0,
                        margin: 0, textAlign: 'center', zIndex: 10, pointerEvents: 'none',
                        color: 'rgba(255,255,255,0.4)', fontSize: '10px',
                        fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase',
                        fontFamily: "'Inter', sans-serif",
                        transition: 'opacity 0.3s',
                    }}>
                        {hint}
                    </p>
                </div>

                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '8px 12px 40px',
                    position: 'relative',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    width: '100%',
                    boxSizing: 'border-box',
                }}>
                    {/* Ambient glow */}
                    <div style={{
                        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                        width: '80%', height: '200px',
                        background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
                        pointerEvents: 'none',
                    }} />

                    <div style={{ width: '100%', maxWidth: '440px' }}>
                        <MemoizedSignUp
                            routing="path"
                            path="/signup"
                            signInUrl="/login"
                            fallbackRedirectUrl="/dashboard"
                            appearance={clerkAppearance}
                        />
                    </div>
                </div>
            </div>
            </>
        )
    }

    /* ═══════════════════════════════════════════════════════════════════════
       DESKTOP LAYOUT — side by side 50/50
       ═══════════════════════════════════════════════════════════════════════ */
    return (
        <div style={{
            display: 'flex',
            height: '100dvh',
            width: '100vw',
            overflow: 'hidden',
            background: DARK,
            fontFamily: "'Inter', system-ui, sans-serif",
        }}>

            {/* ── LEFT PANEL: full-panel Rive ── */}
            <div style={{ flex: '0 0 50%', position: 'relative', overflow: 'hidden', background: DARK }}>
                <TeddyRive isTyping={isTypingPassword} isChecking={isChecking} />

                {/* Strong radial dark overlay to kill the white canvas bg in the center */}
                <div style={{
                    position: 'absolute', inset: 0, zIndex: 1,
                    background: `radial-gradient(ellipse 70% 60% at center, transparent 20%, ${DARK}88 55%, ${DARK} 85%)`,
                    pointerEvents: 'none',
                }} />

                {/* Edge blend gradients */}
                <Overlay style={{ top: 0, left: 0, right: 0, height: '40%', background: `linear-gradient(to bottom, ${DARK} 0%, ${DARK}cc 25%, transparent 100%)`, zIndex: 3 }} />
                <Overlay style={{ bottom: 0, left: 0, right: 0, height: '40%', background: `linear-gradient(to top, ${DARK} 0%, ${DARK}cc 25%, transparent 100%)`, zIndex: 3 }} />
                <Overlay style={{ top: 0, left: 0, bottom: 0, width: '18%', background: `linear-gradient(to right, ${DARK} 0%, transparent 100%)`, zIndex: 3 }} />
                <Overlay style={{ top: 0, right: 0, bottom: 0, width: '25%', background: `linear-gradient(to left, ${DARK} 0%, transparent 100%)`, zIndex: 3 }} />

                {/* Hint */}
                <div style={{
                    position: 'absolute', bottom: '32px', left: 0, right: 0,
                    textAlign: 'center', zIndex: 10, pointerEvents: 'none',
                }}>
                    <p style={{
                        margin: 0, color: 'rgba(255,255,255,0.45)',
                        fontSize: '11px', fontWeight: 600,
                        letterSpacing: '0.2em', textTransform: 'uppercase',
                        fontFamily: "'Inter', sans-serif",
                        transition: 'opacity 0.4s ease',
                    }}>
                        {hint}
                    </p>
                    <p style={{
                        margin: '16px 0 0', color: 'rgba(255,255,255,0.1)',
                        fontSize: '9px', fontWeight: 500,
                        letterSpacing: '0.3em', textTransform: 'uppercase',
                        fontFamily: "'Inter', sans-serif",
                    }}>
                        Velocity Secure Node © MMXXVI
                    </p>
                </div>
            </div>

            {/* ── RIGHT PANEL: form ── */}
            <div style={{
                flex: '0 0 50%',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', // Keep center but push with padding
                justifyContent: 'center',
                position: 'relative',
                overflowY: 'auto', overflowX: 'hidden',
                background: DARK,
                padding: '40px 32px 40px 200px', // Pushed further right per user request
            }}>
                {/* Ambient glows */}
                <div style={{ position: 'absolute', top: '-5%', right: '-5%', width: '55%', height: '55%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-5%', left: '-5%', width: '45%', height: '45%', background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

                <div style={{ width: '100%', maxWidth: '440px' }}>
                    <MemoizedSignUp
                        routing="path"
                        path="/signup"
                        signInUrl="/login"
                        fallbackRedirectUrl="/dashboard"
                        appearance={clerkAppearance}
                    />
                </div>
            </div>
        </div>
    )
}
