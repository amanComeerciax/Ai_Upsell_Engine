import { SignIn } from '@clerk/clerk-react'
import { Zap } from 'lucide-react'

export default function LoginPage() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#030303] relative overflow-hidden font-sans">
            {/* Background Aesthetics */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-8">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20 mb-2 animate-bounce">
                        <Zap className="h-7 w-7 text-white fill-current" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">Access Core</h1>
                        <p className="text-white/40 font-medium uppercase tracking-[0.2em] text-[10px] mt-2">Initialize secure session</p>
                    </div>
                </div>

                <div className="w-full max-w-[440px] glass-morphism rounded-[32px] overflow-hide border border-white/5 shadow-2xl relative">
                    <SignIn
                        routing="path"
                        path="/login"
                        signUpUrl="/signup"
                        fallbackRedirectUrl="/dashboard"
                        appearance={{
                            variables: {
                                colorPrimary: '#3b82f6',
                                colorBackground: '#0a0a0a',
                                colorText: 'white',
                                colorTextSecondary: 'rgba(255,255,255,0.4)',
                                colorInputBackground: 'rgba(255,255,255,0.02)',
                                colorInputText: 'white',
                                borderRadius: '12px',
                            },
                            elements: {
                                rootBox: 'w-full',
                                card: 'bg-transparent shadow-none border-none p-4 sm:p-8',
                                headerTitle: 'hidden',
                                headerSubtitle: 'hidden',
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
                                internal__footer: 'hidden', // Hide Clerk branding in premium view
                            }
                        }}
                    />
                </div>
            </div>

            {/* Bottom Footer Info */}
            <div className="absolute bottom-8 left-0 right-0 text-center text-white/10 text-[10px] font-black uppercase tracking-[0.5em] pointer-events-none">
                Velocity Secure Node © MMXXVI
            </div>
        </div>
    )
}
