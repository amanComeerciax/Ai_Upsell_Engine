import { SignIn } from '@clerk/clerk-react'
import { useEffect } from 'react'

const FONT_URL = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'


export default function LoginPage() {
    useEffect(() => {
        if (!document.getElementById('login-fonts')) {
            const link = document.createElement('link')
            link.id = 'login-fonts'
            link.rel = 'stylesheet'
            link.href = FONT_URL
            document.head.appendChild(link)
        }
    }, [])

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#030303] relative overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            {/* Background Aesthetics */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-8">



                    <SignIn
                        routing="path"
                        path="/login"
                        signUpUrl="/signup"
                        fallbackRedirectUrl="/dashboard"
                        appearance={{
                            variables: {
                                colorPrimary: '#06B6D4',
                                colorBackground: '#0d0d1a',
                                colorText: 'white',
                                colorTextSecondary: 'rgba(255,255,255,0.4)',
                                colorInputBackground: 'rgba(255,255,255,0.04)',
                                colorInputText: 'white',
                                borderRadius: '8px',
                                fontFamily: "'Inter', system-ui, sans-serif",
                            },
                            elements: {
                                rootBox: { width: '100%' },
                                card: {
                                    background: '#0d0d1a',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '24px',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.55)',
                                    padding: '40px',
                                },
                                headerTitle: { display: 'block', color: 'white', fontSize: '24px', fontWeight: 800, fontFamily: "'Inter', sans-serif" },
                                headerSubtitle: { display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontFamily: "'Inter', sans-serif" },
                                formButtonPrimary: {
                                    background: 'linear-gradient(135deg, #06B6D4 0%, #3b82f6 100%)',
                                    color: 'white',
                                    fontWeight: 700,
                                    fontSize: '13px',
                                    fontFamily: "'Inter', sans-serif",
                                    letterSpacing: '0.08em',
                                    height: '46px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 8px 24px rgba(6, 182, 212, 0.35)',
                                    textTransform: 'uppercase',
                                    transition: 'all 0.2s',
                                },
                                socialButtonsBlockButton: {
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    color: 'white',
                                    borderRadius: '12px',
                                    height: '46px',
                                    fontWeight: 700,
                                    fontSize: '12px',
                                    fontFamily: "'Inter', sans-serif",
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                },
                                socialButtonsBlockButtonText: { color: 'white', fontWeight: 700 },
                                formFieldLabel: {
                                    fontSize: '10px',
                                    fontWeight: 900,
                                    letterSpacing: '0.2em',
                                    textTransform: 'uppercase',
                                    color: 'rgba(255, 255, 255, 0.4)',
                                    marginBottom: '6px',
                                    fontFamily: "'Inter', sans-serif",
                                },
                                formFieldInput: {
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    color: 'white',
                                    borderRadius: '8px',
                                    height: '46px',
                                    fontSize: '14px',
                                    padding: '0 16px',
                                    fontFamily: "'Inter', sans-serif",
                                },
                                footerActionText: { color: 'rgba(255, 255, 255, 0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px' },
                                footerActionLink: { color: '#06B6D4', fontWeight: 800, transition: 'colors 0.2s' },
                                dividerRow: { opacity: 0.15 },
                                dividerText: { fontSize: '10px', fontWeight: 900, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.2)' },
                                footer: { background: 'transparent', paddingTop: 0 },
                                identityPreviewText: { color: 'white' },
                                identityPreviewEditButtonIcon: { color: 'white' },
                                alternativeMethodsBlockButton: { color: 'white', fontWeight: 700 },
                                otpCodeFieldInput: { background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', color: 'white', borderRadius: '8px', height: '46px' },
                                formResendCodeLink: { color: '#06B6D4', fontWeight: 700 },
                                clButton: { color: 'white' },
                                internal__footer: { display: 'none' },
                            }
                        }}
                    />
            </div>

            {/* Bottom Footer Info */}
            <div className="absolute bottom-8 left-0 right-0 text-center text-white/10 text-[10px] font-black uppercase tracking-[0.5em] pointer-events-none">
                Velocity Secure Node © MMXXVI
            </div>
        </div>
    )
}
