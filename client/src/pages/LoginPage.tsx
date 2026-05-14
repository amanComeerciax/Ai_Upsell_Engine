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
                                colorBackground: '#0a0a0a',
                                colorText: 'white',
                                colorTextSecondary: 'rgba(255,255,255,0.4)',
                                colorInputBackground: 'rgba(255,255,255,0.02)',
                                colorInputText: 'white',
                                borderRadius: '8px',
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
                                formFieldInput: 'bg-white/[0.03] border-white/[0.05] text-white rounded-lg h-12 focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all px-4',
                                footerActionText: 'text-white/40 font-bold uppercase tracking-widest text-[9px]',
                                footerActionLink: 'text-cyan-500 hover:text-cyan-400 font-extrabold transition-colors ml-1',
                                dividerRow: 'opacity-20',
                                dividerText: 'text-[9px] font-black uppercase tracking-[0.3em] text-white/20',
                                footer: 'bg-transparent pt-0',
                                identityPreviewText: 'text-white',
                                identityPreviewEditButtonIcon: 'text-white',
                                alternativeMethodsBlockButton: 'text-white font-bold',
                                otpCodeFieldInput: 'bg-white/[0.03] border-white/[0.05] text-white rounded-lg h-12 focus:ring-cyan-500/50',
                                formResendCodeLink: 'text-cyan-500 font-bold',
                                clButton: 'text-white',
                                internal__footer: 'hidden', // Hide Clerk branding in premium view
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
