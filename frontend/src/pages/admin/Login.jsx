import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../features/admin/AuthProvider.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) return <Navigate to="/admin/menus" replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (!email.trim()) return setErrorMessage('Email wajib diisi.');
    if (!/\S+@\S+\.\S+/.test(email.trim())) return setErrorMessage('Format email tidak valid.');
    if (!password) return setErrorMessage('Kata sandi wajib diisi.');

    setIsSubmitting(true);
    const result = await login(email.trim(), password);
    setIsSubmitting(false);

    if (result.success) navigate('/admin/menus');
    else setErrorMessage(result.error);
  };

  return (
    <div className="grid min-h-screen bg-[#f7f2e9] lg:grid-cols-[0.9fr_1.1fr]">
      <div className="hidden bg-[#281a13] p-10 text-[#fffdf8] lg:flex lg:flex-col lg:justify-between lg:p-16">
        <div>
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center bg-[#b5532c] font-serif text-xl">H</span>
            <span>
              <span className="block font-serif text-2xl leading-none">Himar Coffee</span>
              <span className="mt-2 block text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#b9c9af]">Garut</span>
            </span>
          </Link>
        </div>
        <div className="max-w-md">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#b9c9af]">Ruang kerja admin</p>
          <h1 className="mt-5 text-6xl leading-[0.95]">Atur apa yang pelanggan temukan di Himar.</h1>
          <p className="mt-6 text-sm leading-7 text-[#fffdf8]/65">Kelola menu, jadwal event, dan percakapan pelanggan dari satu tempat.</p>
        </div>
        <p className="text-xs text-[#fffdf8]/42">Gunakan akun admin yang sudah terdaftar di Supabase Auth.</p>
      </div>

      <div className="flex items-center justify-center px-5 py-12 md:px-10">
        <div className="w-full max-w-md">
          <Link to="/" className="text-xs font-bold uppercase tracking-[0.12em] text-[#6b625b] transition hover:text-[#b5532c]">Kembali ke web publik</Link>
          <div className="mt-12">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#4f6d52]">Masuk</p>
            <h2 className="mt-3 text-5xl leading-[0.95] text-[#281a13]">Selamat datang kembali.</h2>
            <p className="mt-5 text-sm leading-7 text-[#6b625b]">Masuk untuk memperbarui menu dan jadwal yang tampil di web Himar.</p>
          </div>

          {errorMessage && <div className="mt-8 border-l-2 border-[#b5532c] bg-[#fff8f3] px-4 py-3 text-sm leading-6 text-[#6b625b]" role="alert">{errorMessage}</div>}

          <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
            <div>
              <label htmlFor="admin-email" className="block text-xs font-bold uppercase tracking-[0.12em] text-[#281a13]">Email</label>
              <div className="relative mt-3">
                <Mail className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b5532c]" aria-hidden="true" />
                <input id="admin-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@email.com" className="min-h-12 w-full border-b border-[#281a13] bg-transparent pl-8 pr-2 text-sm text-[#281a13] placeholder:text-[#6b625b]/70 focus:border-[#b5532c] focus:outline-none" autoComplete="email" />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-xs font-bold uppercase tracking-[0.12em] text-[#281a13]">Kata sandi</label>
              <div className="relative mt-3">
                <Lock className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b5532c]" aria-hidden="true" />
                <input id="admin-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Masukkan kata sandi" className="min-h-12 w-full border-b border-[#281a13] bg-transparent pl-8 pr-12 text-sm text-[#281a13] placeholder:text-[#6b625b]/70 focus:border-[#b5532c] focus:outline-none" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-0 top-1/2 inline-flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center text-[#6b625b] transition hover:text-[#b5532c]" aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}>
                  {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="mt-3 inline-flex min-h-12 items-center justify-center gap-2 bg-[#b5532c] px-5 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:bg-[#8c3f25] disabled:cursor-wait disabled:bg-[#6b625b]">
              {isSubmitting ? 'Memeriksa akses' : 'Masuk ke ruang kerja'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
