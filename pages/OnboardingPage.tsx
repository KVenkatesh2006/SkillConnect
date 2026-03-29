import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OnboardingPage: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Finalize onboarding and go back to dashboard
      navigate('/');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-16 bg-white/80 backdrop-blur-xl border-b border-outline-variant/10 shadow-sm">
        <div className="text-xl font-bold tracking-tighter text-indigo-700 font-headline">The Academic Exchange</div>
        <div className="flex items-center space-x-4">
          <span className="text-label-md text-outline font-medium">Step {step} of 3</span>
          <div className="w-32 h-2 bg-surface-container rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500" 
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20 px-6 max-w-5xl mx-auto min-h-screen flex flex-col items-center justify-center">
        
        {/* Step 1: Role Selection */}
        {step === 1 && (
          <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-full text-center mb-12">
              <h1 className="font-headline text-4xl md:text-5xl font-bold text-on-surface mb-4 tracking-tight">Choose your path.</h1>
              <p className="text-lg text-on-surface-variant max-w-xl mx-auto">Select how you want to participate in the academic exchange.</p>
            </div>
            <section className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-10">
              <div onClick={handleNext} className="group cursor-pointer bg-surface-container-lowest p-12 rounded-xl transition-all hover:scale-[1.02] hover:shadow-xl border border-outline-variant/10">
                <div className="w-20 h-20 bg-primary-fixed rounded-xl flex items-center justify-center mb-8">
                  <span className="material-symbols-outlined text-[40px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
                </div>
                <h2 className="font-headline text-2xl font-bold mb-4">I want to learn</h2>
                <p className="text-base text-on-surface-variant mb-8">Connect with experienced seniors and industry mentors to accelerate your growth.</p>
                <div className="flex items-center gap-2 text-primary font-bold group-hover:gap-4 transition-all">
                  Select Junior Path <span className="material-symbols-outlined">arrow_right_alt</span>
                </div>
              </div>

              <div onClick={handleNext} className="group cursor-pointer bg-surface-container-lowest p-12 rounded-xl transition-all hover:scale-[1.02] hover:shadow-xl border border-outline-variant/10">
                <div className="w-20 h-20 bg-secondary-fixed rounded-xl flex items-center justify-center mb-8">
                  <span className="material-symbols-outlined text-[40px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                </div>
                <h2 className="font-headline text-2xl font-bold mb-4">I want to teach</h2>
                <p className="text-base text-on-surface-variant mb-8">Share your expertise, build your reputation, and help fellow students succeed.</p>
                <div className="flex items-center gap-2 text-secondary font-bold group-hover:gap-4 transition-all">
                  Select Senior Path <span className="material-symbols-outlined">arrow_right_alt</span>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Step 2: Profile Setup */}
        {step === 2 && (
          <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="w-full max-w-2xl mx-auto">
              <div className="flex flex-col items-center mb-12">
                <div className="relative group cursor-pointer">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-surface-container-high relative">
                    <img 
                      className="w-full h-full object-cover" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_BrkuZrvOVhDazW_9aOTG3kmx1aMSer2gJ3MjPlB_fRuDFDMVM9mBcuUJgb_B0uCNlGo7xpiRlsxY3YwK0VU-TXnnprIrem-qpP-xxgJzmADcex-2dMEierOwDA4_ZznA_PUmpN6lpVUYX3zYMAUGs57Jg1iHpqy4rIeYOa3pZKFxrdAGBode4lThlyKVdtYFSyJ1gKvu0EwThAjmaUSP3fTv3DidW884fffaDIweJxy6s9Z9kwidBpF3wgNRxlmUSrjJQ0rXDg4x"
                      alt="Profile Upload"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="material-symbols-outlined text-white">photo_camera</span>
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </div>
                </div>
                <h2 className="font-headline text-3xl font-bold mt-6">Complete your profile</h2>
              </div>
              <div className="space-y-8 bg-surface-container-lowest p-8 rounded-xl shadow-[0_20px_40px_-12px_rgba(25,28,30,0.08)]">
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2 font-label">Short Bio</label>
                  <textarea 
                    className="w-full p-4 bg-surface-container-low border border-transparent rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none text-base transition-all" 
                    placeholder="Tell us a bit about your academic journey and interests..." 
                    rows={4}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-3 font-label">General Expertise Level</label>
                  <div className="grid grid-cols-3 gap-4">
                    <button className="py-3 px-2 border-2 border-primary bg-primary/5 rounded-lg font-bold text-primary text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/50">Beginner</button>
                    <button className="py-3 px-2 border border-outline-variant/30 rounded-lg font-medium text-on-surface-variant text-sm hover:bg-surface-container hover:text-on-surface transition-all">Intermediate</button>
                    <button className="py-3 px-2 border border-outline-variant/30 rounded-lg font-medium text-on-surface-variant text-sm hover:bg-surface-container hover:text-on-surface transition-all">Advanced</button>
                  </div>
                </div>
                <button 
                  onClick={handleNext}
                  className="w-full py-4 mt-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-lg"
                >
                  Continue to Skills
                </button>
              </div>
            </section>
          </div>
        )}

        {/* Step 3: Skills Selection */}
        {step === 3 && (
          <div className="w-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-full text-center mb-12">
              <h1 className="font-headline text-4xl md:text-5xl text-on-surface mb-4 font-bold tracking-tight">Expand your horizon.</h1>
              <p className="text-lg text-on-surface-variant max-w-xl mx-auto">Select the skills you want to master or share with the community. We'll find the perfect match for your journey.</p>
            </div>
            
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-7 flex flex-col space-y-8">
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
                  <input 
                    className="w-full pl-12 pr-4 py-5 bg-surface-container-low border border-transparent rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest focus:border-primary/30 transition-all text-base outline-none shadow-sm" 
                    placeholder="Search for skills (e.g. Python, UX Design, Calculus)" 
                    type="text" 
                  />
                </div>
                
                <div className="space-y-6">
                  <h3 className="font-headline text-2xl font-bold">Suggested for you</h3>
                  <div className="flex flex-wrap gap-3">
                    <button className="px-6 py-2.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold hover:scale-[1.05] active:scale-95 transition-transform text-sm shadow-sm">Data Science</button>
                    <button className="px-6 py-2.5 rounded-full bg-surface-container-lowest text-on-surface-variant border border-outline-variant/20 font-medium hover:scale-[1.05] active:scale-95 transition-transform text-sm hover:border-outline-variant/40">Macroeconomics</button>
                    <button className="px-6 py-2.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold hover:scale-[1.05] active:scale-95 transition-transform text-sm shadow-sm">Creative Writing</button>
                    <button className="px-6 py-2.5 rounded-full bg-surface-container-lowest text-on-surface-variant border border-outline-variant/20 font-medium hover:scale-[1.05] active:scale-95 transition-transform text-sm hover:border-outline-variant/40">Public Speaking</button>
                    <button className="px-6 py-2.5 rounded-full bg-surface-container-lowest text-on-surface-variant border border-outline-variant/20 font-medium hover:scale-[1.05] active:scale-95 transition-transform text-sm hover:border-outline-variant/40">Linear Algebra</button>
                    <button className="px-6 py-2.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold hover:scale-[1.05] active:scale-95 transition-transform text-sm shadow-sm">User Research</button>
                    <button className="px-6 py-2.5 rounded-full bg-surface-container-lowest text-on-surface-variant border border-outline-variant/20 font-medium hover:scale-[1.05] active:scale-95 transition-transform text-sm hover:border-outline-variant/40">Astrophysics</button>
                  </div>
                </div>

                <div className="mt-4 p-8 bg-surface-container-low rounded-xl relative overflow-hidden group border border-outline-variant/10">
                  <div className="relative z-10">
                    <h4 className="font-headline text-xl font-bold mb-2">Can't find a skill?</h4>
                    <p className="text-base text-on-surface-variant mb-4">Request a new category and we'll notify you when a mentor joins.</p>
                    <button className="text-primary font-bold flex items-center gap-2 group-hover:gap-3 transition-all hover:underline">
                      Submit a request <span className="material-symbols-outlined font-bold">arrow_forward</span>
                    </button>
                  </div>
                  <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_20px_40px_-12px_rgba(25,28,30,0.08)] sticky top-32 border border-outline-variant/10">
                  <h3 className="font-headline text-2xl font-bold mb-6">Your Selection</h3>
                  <div className="space-y-4 mb-8 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                    <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-outline-variant/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-fixed flex items-center justify-center rounded-lg text-primary">
                          <span className="material-symbols-outlined">code</span>
                        </div>
                        <div>
                          <p className="font-bold text-sm text-on-surface">Python Development</p>
                          <p className="text-xs text-outline font-medium">Software Engineering</p>
                        </div>
                      </div>
                      <button className="text-error hover:scale-110 hover:bg-error-container p-1 rounded-full transition-all">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-outline-variant/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary-fixed flex items-center justify-center rounded-lg text-secondary">
                          <span className="material-symbols-outlined">palette</span>
                        </div>
                        <div>
                          <p className="font-bold text-sm text-on-surface">UI/UX Design</p>
                          <p className="text-xs text-outline font-medium">Creative Arts</p>
                        </div>
                      </div>
                      <button className="text-error hover:scale-110 hover:bg-error-container p-1 rounded-full transition-all">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-outline-variant/20">
                    <p className="text-xs font-medium text-on-surface-variant italic mb-6">"You've selected 2 skills. We suggest picking at least 3 for a better matching experience."</p>
                    <button 
                      onClick={handleNext}
                      className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-base"
                    >
                      Finish & Navigate
                    </button>
                    <button 
                      onClick={handleNext}
                      className="w-full py-4 mt-3 text-outline font-bold hover:text-on-surface transition-colors text-sm"
                    >
                      Skip for now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 w-full p-6 flex justify-between items-center bg-white/60 backdrop-blur-md pointer-events-none z-40 border-t border-outline-variant/10">
        <div className="pointer-events-auto">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 px-6 py-3 text-on-surface-variant font-bold hover:bg-surface-container hover:text-on-surface rounded-full transition-colors text-sm"
          >
            <span className="material-symbols-outlined">chevron_left</span>
            Back
          </button>
        </div>
        <div className="flex gap-4 pointer-events-auto">
          {step < 3 && (
             <div className="hidden md:flex items-center text-xs text-outline mr-4 font-medium">
                Press <span className="mx-1 px-1.5 py-0.5 bg-surface-container-highest rounded border border-outline-variant/30 text-[10px] font-bold text-on-surface">ENTER</span> to proceed
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
