import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Coffee, Eye, EyeOff, Lock, Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../features/admin/AuthProvider.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect
  if (user) {
    return <Navigate to="/admin/menus" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Client-side validation
    if (!email.trim()) {
      setErrorMessage('Email wajib diisi.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setErrorMessage('Format email tidak valid.');
      return;
    }
    if (!password) {
      setErrorMessage('Kata sandi wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email.trim(), password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/admin/menus');
    } else {
      setErrorMessage(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF4EA] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#E7DCCB] p-8 md:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#B5532C] text-white flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Coffee className="w-7 h-7" />
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#2B1B12]">
            Portal Admin
          </h1>
          <p className="text-xs text-[#2B1B12]/60 mt-1">
            Himar Coffee Garut — Masuk untuk mengelola menu dan event
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#2B1B12] mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2B1B12]/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF4EA]/40 border border-[#E7DCCB] rounded-xl text-xs text-[#2B1B12] focus:outline-none focus:ring-1 focus:ring-[#B5532C] focus:border-[#B5532C] transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#2B1B12] mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2B1B12]/40" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-[#FAF4EA]/40 border border-[#E7DCCB] rounded-xl text-xs text-[#2B1B12] focus:outline-none focus:ring-1 focus:ring-[#B5532C] focus:border-[#B5532C] transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#2B1B12]/40 hover:text-[#2B1B12] transition cursor-pointer"
                aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 bg-[#B5532C] hover:bg-[#a04622] disabled:bg-gray-400 text-white font-medium py-3 rounded-xl text-xs shadow-sm transition cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <span>Masuk ke Dasbor</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-xs text-[#2B1B12]/60 hover:text-[#B5532C] inline-flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Kembali ke Beranda Pelanggan
          </a>
        </div>
      </div>
    </div>
  );
}
