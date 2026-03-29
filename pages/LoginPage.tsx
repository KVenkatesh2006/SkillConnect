import React, { useState } from 'react';
import { User } from '../types';
import { authService } from '../services/mockDatabase';
import { Link } from 'react-router-dom';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [rollNo, setRollNo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await authService.login(rollNo, password);
    if (result.success && result.user) {
      onLogin(result.user);
    } else {
      setError(result.message || 'Login failed. Please check your credentials.');
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen">
      {/* Left Section: Visual Inspiration */}
      <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary-container items-center justify-center p-12">
        {/* Decorative Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-secondary opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-80 h-80 bg-primary opacity-30 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 w-full max-w-2xl text-center">
          <div className="mb-12 rounded-lg overflow-hidden shadow-[0_20px_40px_-12px_rgba(25,28,30,0.2)] transform -rotate-2 hover:rotate-0 transition-transform duration-500">
            <img 
              alt="Students collaborating" 
              className="w-full h-[500px] object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA92rQ7ikQHmvS27MI-Ny6LDyeUSnpijTbGh5NjCCpOb8cWAFabomWZvgCQj-8uxwVJkO3iWMaQ0_ovVfgvyCeT1sgVxalLBPCaw51WFu_2QKeRLX2CAw0KDl-DxhR7TZ3tcI9UhRkHLcpiuA85_dNdG4xbS-5JforOmbJ5TRQXRkjzC5vK56LczGUdCLKE_2p8FuY7yM9KNizJhoaRlyAcpaNmgn1aALp4SLzaEX0X0v50n-sClVlooyOuCgku7r9Hm8yCQMeKnhO5"
            />
          </div>
          <h2 className="font-headline text-4xl md:text-5xl font-bold text-on-primary-container tracking-tight leading-tight mb-4">
            The Digital Atelier for Campus Minds
          </h2>
          <p className="text-on-primary-container/80 text-xl font-medium max-w-md mx-auto">
            Where knowledge isn't just shared, it's curated through collaboration. Join the exchange.
          </p>
        </div>

        {/* Floating Decorative Card */}
        <div className="absolute bottom-20 right-20 glass-effect p-6 rounded-md shadow-lg flex items-center gap-4 animate-bounce duration-[3000ms]">
          <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center">
            <span className="material-symbols-outlined text-on-secondary-fixed">school</span>
          </div>
          <div className="text-left">
            <p className="font-headline font-bold text-on-surface">500+ Skills</p>
            <p className="font-label text-sm text-on-surface-variant">Ready to swap today</p>
          </div>
        </div>
      </section>

      {/* Right Section: Login Form */}
      <section className="w-full lg:w-1/2 bg-surface flex flex-col items-center justify-center p-8 md:p-16 lg:p-24 overflow-y-auto">
        {/* Brand Logo */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 mb-8 group cursor-pointer">
            <div className="w-10 h-10 bg-login-gradient rounded-full flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>swap_horiz</span>
            </div>
            <span className="font-headline text-xl font-extrabold tracking-tighter text-primary">Skill-Share</span>
          </div>
          <h1 className="font-headline text-3xl md:text-4xl text-on-surface mb-2 font-bold tracking-tight">Learn faster. Teach smarter.</h1>
          <p className="text-on-surface-variant text-lg">Welcome back to the exchange.</p>
        </div>

        <div className="w-full max-w-md space-y-8">
          {error && (
            <div className="p-4 rounded-lg bg-error-container border border-error/20 flex flex-col items-center gap-2 text-on-error-container text-sm">
              <span className="material-symbols-outlined text-[24px]">error</span>
              <p className="font-medium text-center">{error}</p>
            </div>
          )}

          {/* Social Login */}
          <button className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-full bg-surface-container-lowest text-on-surface font-medium border border-outline-variant/15 hover:bg-surface-container-low hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"></path>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-outline-variant/20"></div>
            <span className="flex-shrink mx-4 font-label text-sm text-outline font-medium">OR ROLL NUMBER</span>
            <div className="flex-grow border-t border-outline-variant/20"></div>
          </div>

          {/* Form Fields */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="group">
                <label className="block font-label text-sm font-semibold text-on-surface-variant mb-2 ml-1" htmlFor="rollNo">Roll Number</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">badge</span>
                  <input 
                    className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low border-none rounded-md focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest text-on-surface transition-all placeholder:text-outline/60" 
                    id="rollNo" 
                    name="rollNo" 
                    placeholder="e.g., 2023CS101" 
                    type="text"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="group">
                <label className="block font-label text-sm font-semibold text-on-surface-variant mb-2 ml-1" htmlFor="password">Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">lock</span>
                  <input 
                    className="w-full pl-12 pr-12 py-3.5 bg-surface-container-low border-none rounded-md focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest text-on-surface transition-all placeholder:text-outline/60" 
                    id="password" 
                    name="password" 
                    placeholder="••••••••" 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/30" type="checkbox" />
                <span className="font-label text-sm text-on-surface-variant group-hover:text-on-surface">Remember me</span>
              </label>
              <a className="font-label text-sm font-semibold text-primary hover:text-secondary-container transition-colors" href="#">Forgot Password?</a>
            </div>

            <button 
              className="w-full py-4 bg-login-gradient text-white rounded-full font-headline font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50" 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Footer Link */}
          <p className="text-center font-body text-base text-on-surface-variant mt-10">
            Don't have an account? 
            <Link to="/onboarding" className="text-primary font-bold hover:underline underline-offset-4 decoration-primary/30 ml-2">Sign up</Link>
          </p>

          {/* Support/Privacy Links */}
          <div className="flex items-center justify-center gap-6 pt-12">
            <a className="font-label text-sm text-outline hover:text-on-surface-variant" href="#">Terms of Service</a>
            <a className="font-label text-sm text-outline hover:text-on-surface-variant" href="#">Privacy Policy</a>
            <a className="font-label text-sm text-outline hover:text-on-surface-variant" href="#">Help Center</a>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
