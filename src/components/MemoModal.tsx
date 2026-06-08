'use client';

import React, { useState, useEffect } from 'react';
import { Memo } from '@/types';

interface MemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  memo: Memo | null;
  onSave: (memoData: Partial<Memo> & { type: 'account' | 'site' }) => void;
  onDelete: (id: string) => void;
}

const COLORS = [
  { name: 'blue', label: '블루', border: 'border-blue-500', bg: 'bg-blue-500', text: 'text-blue-700', bgLight: 'bg-blue-50' },
  { name: 'purple', label: '퍼플', border: 'border-purple-500', bg: 'bg-purple-500', text: 'text-purple-700', bgLight: 'bg-purple-50' },
  { name: 'green', label: '그린', border: 'border-emerald-500', bg: 'bg-emerald-500', text: 'text-emerald-700', bgLight: 'bg-emerald-50' },
  { name: 'orange', label: '오렌지', border: 'border-orange-500', bg: 'bg-orange-500', text: 'text-orange-700', bgLight: 'bg-orange-50' },
  { name: 'pink', label: '핑크', border: 'border-pink-500', bg: 'bg-pink-500', text: 'text-pink-700', bgLight: 'bg-pink-50' },
  { name: 'gray', label: '그레이', border: 'border-slate-500', bg: 'bg-slate-500', text: 'text-slate-700', bgLight: 'bg-slate-50' },
];

const EMOJIS = ['🔐', '🤖', '🎬', '🎨', '📚', '🌐', '🛠️', '💳'];

export default function MemoModal({ isOpen, onClose, memo, onSave, onDelete }: MemoModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [type, setType] = useState<'account' | 'site'>('account');
  const [error, setError] = useState('');

  // Common fields
  const [color, setColor] = useState('blue');
  const [emoji, setEmoji] = useState('🔐');

  // Account specific fields
  const [serviceName, setServiceName] = useState('');
  const [planName, setPlanName] = useState('');
  const [paymentContent, setPaymentContent] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly'); // monthly, yearly, etc.
  const [paymentAmount, setPaymentAmount] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');

  // Site specific fields
  const [siteName, setSiteName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [description, setDescription] = useState('');

  // View state password toggle
  const [showRawPassword, setShowRawPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<'id' | 'pwd' | 'url' | null>(null);

  // Sync state when memo changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setShowRawPassword(false);
      setCopiedField(null);
      setError('');

      if (memo) {
        setIsEditing(false);
        setType(memo.type);
        setColor(memo.color || 'blue');
        setEmoji(memo.emoji || '🔐');

        if (memo.type === 'account') {
          setServiceName(memo.serviceName || memo.title || '');
          setPlanName(memo.planName || '');
          setPaymentContent(memo.paymentContent || memo.content || '');
          setBillingCycle(memo.billingCycle || 'monthly');
          setPaymentAmount(memo.paymentAmount || '');
          setLoginId(memo.loginId || '');
          setPassword(memo.password || '');
        } else {
          setSiteName(memo.title || '');
          setSiteUrl(memo.siteUrl || '');
          setDescription(memo.content || '');
        }
      } else {
        setIsEditing(true); // Create mode
        setType('account');
        setColor('blue');
        setEmoji('🔐');
        setServiceName('');
        setPlanName('');
        setPaymentContent('');
        setBillingCycle('monthly');
        setPaymentAmount('');
        setLoginId('');
        setPassword('');
        setSiteName('');
        setSiteUrl('');
        setDescription('');
      }
    }
  }, [isOpen, memo]);

  if (!isOpen) return null;

  // Masking password logic: 앞 2글자 + 마스킹 + 뒤 2글자
  const maskPassword = (pwd: string) => {
    if (!pwd) return '';
    if (pwd.length <= 4) {
      return '••••••••';
    }
    const start = pwd.slice(0, 2);
    const end = pwd.slice(-2);
    const masked = '•'.repeat(Math.max(4, pwd.length - 4));
    return `${start}${masked}${end}`;
  };

  const handleCopy = (text: string, field: 'id' | 'pwd' | 'url') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (type === 'account') {
      if (!serviceName.trim()) {
        setError('서비스명을 입력해주세요.');
        return;
      }
      if (!loginId.trim()) {
        setError('아이디를 입력해주세요.');
        return;
      }
      if (!password.trim()) {
        setError('비밀번호를 입력해주세요.');
        return;
      }

      onSave({
        id: memo?.id,
        type: 'account',
        title: serviceName.trim(), // Keep title synced
        content: paymentContent.trim(), // Keep content synced
        color,
        emoji,
        serviceName: serviceName.trim(),
        planName: planName.trim(),
        paymentContent: paymentContent.trim(),
        billingCycle,
        paymentAmount: paymentAmount.trim(),
        loginId: loginId.trim(),
        password: password.trim(),
        // Reset site properties for accounts
        siteUrl: '',
      });
    } else {
      if (!siteName.trim()) {
        setError('사이트명을 입력해주세요.');
        return;
      }
      if (!siteUrl.trim()) {
        setError('URL 주소를 입력해주세요.');
        return;
      }

      // Automatically prepend https:// if missing
      let formattedUrl = siteUrl.trim();
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = `https://${formattedUrl}`;
      }

      onSave({
        id: memo?.id,
        type: 'site',
        title: siteName.trim(), // Keep title synced
        content: description.trim(), // Keep content synced
        color,
        emoji,
        siteUrl: formattedUrl,
        // Reset account properties for sites
        serviceName: '',
        planName: '',
        paymentContent: '',
        billingCycle: '',
        paymentAmount: '',
        loginId: '',
        password: '',
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (memo && confirm('정말로 이 공유 내역을 삭제하시겠습니까?')) {
      onDelete(memo.id);
      onClose();
    }
  };

  const selectedColorMeta = COLORS.find(c => c.name === color) || COLORS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all animate-modal-in border border-slate-100 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <h3 className="text-lg font-bold text-slate-900">
            {memo ? (isEditing ? '공유 정보 수정' : '상세 정보') : '새 공유 등록'}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto pr-1 flex-1">
          {error && (
            <div className="mb-4 rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-600 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Type Switcher (only for new creations) */}
              {!memo && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">공유 유형</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => { setType('account'); setEmoji('🔐'); }}
                      className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 border text-sm font-semibold transition ${
                        type === 'account'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-600/10'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      🔐 계정 공유
                    </button>
                    <button
                      type="button"
                      onClick={() => { setType('site'); setEmoji('🌐'); }}
                      className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 border text-sm font-semibold transition ${
                        type === 'site'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-600/10'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      🌐 사이트 공유
                    </button>
                  </div>
                </div>
              )}

              {/* Color Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">대표 색상</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setColor(c.name)}
                      className={`flex h-8 items-center justify-center rounded-lg px-3 text-xs font-bold border transition ${
                        color === c.name
                          ? `${c.border} ${c.bgLight} ${c.text} ring-2 ring-offset-1`
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`mr-1.5 h-2 w-2 rounded-full ${c.bg}`}></span>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Emoji Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">이모지 아이콘</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJIS.map((emo) => (
                    <button
                      key={emo}
                      type="button"
                      onClick={() => setEmoji(emo)}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg border transition ${
                        emoji === emo
                          ? 'border-slate-900 bg-slate-50 shadow-sm ring-1 ring-slate-900'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-slate-100 my-2" />

              {/* Type specific forms */}
              {type === 'account' ? (
                /* Account Fields */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="serviceName" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">서비스명 *</label>
                      <input
                        type="text"
                        id="serviceName"
                        value={serviceName}
                        onChange={(e) => setServiceName(e.target.value)}
                        placeholder="예: Figma, AWS, Github"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition"
                      />
                    </div>
                    <div>
                      <label htmlFor="planName" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">요금 플랜명</label>
                      <input
                        type="text"
                        id="planName"
                        value={planName}
                        onChange={(e) => setPlanName(e.target.value)}
                        placeholder="예: Enterprise, Team Pro"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label htmlFor="billingCycle" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">결제 주기</label>
                      <select
                        id="billingCycle"
                        value={billingCycle}
                        onChange={(e) => setBillingCycle(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition"
                      >
                        <option value="monthly">월 결제</option>
                        <option value="yearly">연 결제</option>
                        <option value="custom">기타 결제</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="paymentAmount" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">결제 금액 및 수단</label>
                      <input
                        type="text"
                        id="paymentAmount"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="예: $15 / 월 (법인카드 1234)"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="paymentContent" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">결제 내용 / 기타 설명</label>
                    <input
                      type="text"
                      id="paymentContent"
                      value={paymentContent}
                      onChange={(e) => setPaymentContent(e.target.value)}
                      placeholder="결제일 정보, 소유주 등 세부 사항 기록"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="loginId" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">로그인 ID *</label>
                      <input
                        type="text"
                        id="loginId"
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        placeholder="공용 이메일 또는 ID"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition"
                      />
                    </div>
                    <div>
                      <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">비밀번호 *</label>
                      <input
                        type="text"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="접속 비밀번호"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Site Fields */
                <div className="space-y-4">
                  <div>
                    <label htmlFor="siteName" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">사이트명 *</label>
                    <input
                      type="text"
                      id="siteName"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      placeholder="예: 사내 가이드 문서, Trello 보드"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition"
                    />
                  </div>

                  <div>
                    <label htmlFor="siteUrl" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">사이트 URL *</label>
                    <input
                      type="text"
                      id="siteUrl"
                      value={siteUrl}
                      onChange={(e) => setSiteUrl(e.target.value)}
                      placeholder="https://example.company.com"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">설명 또는 메모</label>
                    <textarea
                      id="description"
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="사이트 용도, 담당 부서, 접속 방법 등 기재"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
                {memo && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                  >
                    취소
                  </button>
                )}
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 hover:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition"
                >
                  저장
                </button>
              </div>
            </form>
          ) : (
            /* View Details mode */
            <div className="space-y-6">
              
              {/* Type & Color Ribbon */}
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${selectedColorMeta.text} ${selectedColorMeta.bgLight} ring-current`}>
                  <span className="text-sm mr-0.5">{emoji}</span>
                  {type === 'account' ? '계정 공유' : '사이트 공유'}
                </span>
                {memo && (
                  <span className="text-xs text-slate-400">
                    마지막 수정: {new Date(memo.updatedAt).toLocaleString('ko-KR')}
                  </span>
                )}
              </div>

              {/* Main Info */}
              <div className="flex items-start gap-3">
                <span className="text-3xl p-2.5 bg-slate-100 rounded-2xl flex items-center justify-center shadow-inner">{emoji}</span>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                    {type === 'account' ? serviceName : siteName}
                  </h2>
                  {type === 'account' && planName && (
                    <p className="text-sm font-medium text-slate-500 mt-1">플랜: {planName}</p>
                  )}
                </div>
              </div>

              {type === 'account' ? (
                /* Account Detail Layout */
                <div className="space-y-4">
                  {/* Credentials Box */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">접속 정보</span>
                      <span className="text-[10px] text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded font-mono">SECURE</span>
                    </div>
                    
                    {/* Login ID */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1.5 border-b border-slate-100">
                      <span className="text-xs font-semibold text-slate-500 w-24">아이디</span>
                      <div className="flex items-center gap-2 flex-1 justify-between">
                        <span className="text-sm font-mono font-semibold text-slate-900 select-all">{loginId}</span>
                        <button
                          onClick={() => handleCopy(loginId, 'id')}
                          className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/50 hover:text-slate-600 transition flex items-center gap-1 text-xs"
                        >
                          {copiedField === 'id' ? '복사됨!' : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.25 2.25 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Password */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1.5">
                      <span className="text-xs font-semibold text-slate-500 w-24">비밀번호</span>
                      <div className="flex items-center gap-2 flex-1 justify-between">
                        <span className="text-sm font-mono font-semibold text-slate-900 select-all">
                          {showRawPassword ? password : maskPassword(password)}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setShowRawPassword(!showRawPassword)}
                            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/50 hover:text-slate-600 transition"
                            title="비밀번호 토글"
                          >
                            {showRawPassword ? (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => handleCopy(password, 'pwd')}
                            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/50 hover:text-slate-600 transition flex items-center gap-1 text-xs"
                          >
                            {copiedField === 'pwd' ? '복사됨!' : (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.25 2.25 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">결제 금액 및 수단</span>
                      <span className="text-sm font-semibold text-slate-800">{paymentAmount || '정보 없음'}</span>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">결제 주기</span>
                      <span className="text-sm font-semibold text-slate-800">
                        {billingCycle === 'monthly' ? '📅 월 결제' : billingCycle === 'yearly' ? '📅 연 결제' : '📅 기타 결제'}
                      </span>
                    </div>
                  </div>

                  {/* Payment Content */}
                  {paymentContent && (
                    <div className="rounded-xl border border-slate-100 bg-slate-50/20 p-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">결제 관련 참고사항</span>
                      <p className="text-sm text-slate-700 leading-relaxed">{paymentContent}</p>
                    </div>
                  )}
                </div>
              ) : (
                /* Site Detail Layout */
                <div className="space-y-4">
                  {/* URL visit block */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 flex items-center justify-between gap-4">
                    <div className="overflow-hidden">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">웹사이트 주소</span>
                      <span className="text-sm font-mono text-slate-600 truncate block select-all">{siteUrl}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopy(siteUrl, 'url')}
                        className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 transition"
                      >
                        {copiedField === 'url' ? '주소 복사됨!' : '주소 복사'}
                      </button>
                      <a
                        href={siteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 text-white px-4 py-2 text-xs font-semibold hover:bg-indigo-700 shadow-sm transition"
                      >
                        바로 가기
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                      </a>
                    </div>
                  </div>

                  {/* Description Box */}
                  <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">설명 / 메모</span>
                    <p className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
                      {description || '등록된 상세 설명이 없습니다.'}
                    </p>
                  </div>
                </div>
              )}

              {/* View Actions */}
              <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  삭제
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                  >
                    닫기
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.83 18.75a4.499 4.499 0 01-2.062 1.238l-3.32.88a.375 0 01-.444-.444l.88-3.32a4.497 4.497 0 011.238-2.062L16.862 4.487z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.125l-2.625-2.625" />
                    </svg>
                    수정
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
