'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import MemoModal from '@/components/MemoModal';
import { Memo } from '@/types';
import { supabase } from '@/lib/supabase';

const COLOR_MAPS: Record<string, { border: string; bg: string; text: string; lightBg: string }> = {
  blue: { border: 'border-blue-500', bg: 'bg-blue-500', text: 'text-blue-700', lightBg: 'bg-blue-50/70' },
  purple: { border: 'border-purple-500', bg: 'bg-purple-500', text: 'text-purple-700', lightBg: 'bg-purple-50/70' },
  green: { border: 'border-emerald-500', bg: 'bg-emerald-500', text: 'text-emerald-700', lightBg: 'bg-emerald-50/70' },
  orange: { border: 'border-orange-500', bg: 'bg-orange-500', text: 'text-orange-700', lightBg: 'bg-orange-50/70' },
  pink: { border: 'border-pink-500', bg: 'bg-pink-500', text: 'text-pink-700', lightBg: 'bg-pink-50/70' },
  gray: { border: 'border-slate-400', bg: 'bg-slate-500', text: 'text-slate-700', lightBg: 'bg-slate-100/70' },
};

export default function Home() {
  const [memos, setMemos] = useState<Memo[]>([]);
  
  // Independent searches
  const [accountQuery, setAccountQuery] = useState('');
  const [siteQuery, setSiteQuery] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);
  const [preselectedType, setPreselectedType] = useState<'account' | 'site'>('account');

  // Load states
  const [isLoading, setIsLoading] = useState(true);
  const [isEnvConfigured, setIsEnvConfigured] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Check env settings
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key || url.includes('YOUR_SUPABASE') || key.includes('YOUR_SUPABASE')) {
      setIsEnvConfigured(false);
    }
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  // Toast automatic dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Read data from Supabase
  const fetchMemos = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('memos')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mapped: Memo[] = data.map((item: any) => ({
          id: item.id,
          type: item.type as 'account' | 'site',
          title: item.title,
          content: item.content,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          emoji: item.emoji,
          color: item.color,
          serviceName: item.service_name,
          planName: item.plan_name,
          paymentContent: item.payment_content,
          billingCycle: item.billing_cycle,
          paymentAmount: item.payment_amount,
          loginId: item.login_id,
          password: item.password,
          siteUrl: item.site_url,
        }));
        setMemos(mapped);
      }
    } catch (e: any) {
      console.error('Failed to fetch from Supabase:', e);
      showToast(`DB 불러오기 실패: ${e?.message || '네트워크 오류'}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMemos();
  }, []);

  // Write/Edit to Supabase
  const handleSaveMemo = async (memoData: Partial<Memo> & { type: 'account' | 'site' }) => {
    const now = new Date().toISOString();

    try {
      // Create DB-aligned snake_case object
      const payload: any = {
        type: memoData.type,
        title: memoData.title || '',
        content: memoData.content || '',
        emoji: memoData.emoji || '',
        color: memoData.color || 'blue',
        service_name: memoData.serviceName || '',
        plan_name: memoData.planName || '',
        payment_content: memoData.paymentContent || '',
        billing_cycle: memoData.billingCycle || '',
        payment_amount: memoData.paymentAmount || '',
        login_id: memoData.loginId || '',
        password: memoData.password || '',
        site_url: memoData.siteUrl || '',
      };

      if (memoData.id) {
        // Edit / Update mode
        const { error } = await supabase
          .from('memos')
          .update(payload)
          .eq('id', memoData.id);

        if (error) throw error;
        showToast('성공적으로 수정되었습니다.', 'success');
      } else {
        // Create / Insert mode - ID, created_at, updated_at are handled by database
        const { error } = await supabase
          .from('memos')
          .insert(payload);

        if (error) throw error;
        showToast('성공적으로 등록되었습니다.', 'success');
      }

      await fetchMemos();
    } catch (e: any) {
      console.error('Error saving memo to Supabase:', e);
      showToast(`저장 실패: ${e?.message || 'DB 에러'}`, 'error');
    }
  };

  // Delete from Supabase
  const handleDeleteMemo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('memos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showToast('삭제 완료되었습니다.', 'info');
      await fetchMemos();
    } catch (e: any) {
      console.error('Error deleting memo from Supabase:', e);
      showToast(`삭제 실패: ${e?.message || 'DB 에러'}`, 'error');
    }
  };

  // 1. Account Search filter logic
  const filteredAccounts = memos
    .filter(memo => memo.type === 'account')
    .filter(memo => {
      if (!accountQuery.trim()) return true;
      const query = accountQuery.toLowerCase();
      const matchService = (memo.serviceName || '').toLowerCase().includes(query);
      const matchPlan = (memo.planName || '').toLowerCase().includes(query);
      const matchId = (memo.loginId || '').toLowerCase().includes(query);
      const matchPayment = (memo.paymentContent || '').toLowerCase().includes(query);
      return matchService || matchPlan || matchId || matchPayment;
    });

  // 2. Site Search filter logic
  const filteredSites = memos
    .filter(memo => memo.type === 'site')
    .filter(memo => {
      if (!siteQuery.trim()) return true;
      const query = siteQuery.toLowerCase();
      const matchName = (memo.title || '').toLowerCase().includes(query);
      const matchUrl = (memo.siteUrl || '').toLowerCase().includes(query);
      const matchDesc = (memo.content || '').toLowerCase().includes(query);
      return matchName || matchUrl || matchDesc;
    });

  // Masking password logic for display card: 앞 2글자 + 마스킹 + 뒤 2글자
  const maskPassword = (pwd?: string) => {
    if (!pwd) return '';
    if (pwd.length <= 4) {
      return '••••••••';
    }
    const start = pwd.slice(0, 2);
    const end = pwd.slice(-2);
    const masked = '•'.repeat(Math.max(4, pwd.length - 4));
    return `${start}${masked}${end}`;
  };

  const openCreateModal = (type: 'account' | 'site') => {
    setPreselectedType(type);
    setSelectedMemo(null);
    setIsModalOpen(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-100/60">
      <Navbar />

      {/* Main Container: 2-Column Split Grid */}
      <main className="flex-1 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Warning Banner */}
          {!isEnvConfigured && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 shadow-sm flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0 animate-bounce">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <span className="font-bold">Supabase 연결이 차단되어 데모 데이터가 로드되었습니다.</span> 
                <span className="text-xs text-amber-700 ml-1">루트의 <code className="bg-amber-200/50 px-1 py-0.5 rounded">.env.local</code>을 정상 설정하고 서버를 재기동해 주세요.</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: Account Sharing (Col Span 8) */}
            <section className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm min-h-[70vh]">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔑</span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">계정 공유</h3>
                    <p className="text-xs text-slate-400 font-medium">회사 공용 유료 서비스 계정 목록</p>
                  </div>
                </div>
                
                {/* Search & Add buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="계정 검색..."
                      value={accountQuery}
                      onChange={(e) => setAccountQuery(e.target.value)}
                      className="w-full sm:w-48 rounded-xl border border-slate-200 bg-slate-50/50 py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 transition"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </div>
                  <button
                    onClick={() => openCreateModal('account')}
                    className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 text-xs font-semibold text-white shadow transition"
                  >
                    + 계정 추가
                  </button>
                </div>
              </div>

              {/* Accounts Content */}
              {isLoading ? (
                /* Skeleton Loader */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map((n) => (
                    <div key={n} className="animate-pulse border border-slate-100 rounded-xl p-5 space-y-3">
                      <div className="h-5 bg-slate-200 rounded w-1/3"></div>
                      <div className="h-4 bg-slate-100 rounded"></div>
                      <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                    </div>
                  ))}
                </div>
              ) : filteredAccounts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredAccounts.map((account) => {
                    const colorMeta = COLOR_MAPS[account.color || 'blue'] || COLOR_MAPS.blue;
                    return (
                      <div
                        key={account.id}
                        onClick={() => {
                          setSelectedMemo(account);
                          setIsModalOpen(true);
                        }}
                        className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border-l-4 ${colorMeta.border} border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-y-slate-300 hover:border-r-slate-300 transition cursor-pointer`}
                      >
                        <div>
                          {/* Top row */}
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-2xl p-1 bg-slate-50 rounded-lg shadow-inner">{account.emoji || '🔐'}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${colorMeta.text} ${colorMeta.lightBg}`}>
                              {account.planName || '공용 계정'}
                            </span>
                          </div>

                          {/* Service Name */}
                          <h4 className="text-base font-bold text-slate-800 group-hover:text-indigo-600 transition-colors mb-3">
                            {account.serviceName || account.title}
                          </h4>

                          {/* Credentials */}
                          <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs font-mono mb-3">
                            <div className="flex justify-between">
                              <span className="text-slate-400">ID:</span>
                              <span className="font-bold text-slate-800 truncate max-w-[170px]">{account.loginId}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">PW:</span>
                              <span className="font-bold text-slate-700">{maskPassword(account.password)}</span>
                            </div>
                          </div>

                          {/* Billing & Cycle Info */}
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-2">
                            <span>💳</span>
                            <span className="truncate max-w-[200px]">
                              {account.paymentAmount ? `${account.paymentAmount}` : '금액 정보 없음'} 
                              {account.billingCycle === 'yearly' ? ' (연)' : account.billingCycle === 'monthly' ? ' (월)' : ''}
                            </span>
                          </div>

                          {/* Payment Content Description */}
                          {account.paymentContent && (
                            <p className="text-[11px] text-slate-400 line-clamp-1 italic bg-slate-50 p-1.5 rounded">
                              {account.paymentContent}
                            </p>
                          )}
                        </div>

                        {/* Bottom Actions */}
                        <div className="mt-4 flex items-center justify-end text-[10px] font-bold text-slate-400 group-hover:text-slate-900 transition">
                          접속 정보 보기
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3 ml-0.5 transition-transform group-hover:translate-x-0.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl py-12 text-center text-slate-400">
                  <span className="text-3xl mb-2">🔍</span>
                  <p className="text-xs font-semibold">등록된 계정이 없습니다.</p>
                </div>
              )}
            </section>

            {/* RIGHT COLUMN: Site Reference Dashboard (Col Span 4) */}
            <section className="lg:col-span-4 bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 min-h-[70vh] flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🌐</span>
                    <div>
                      <h3 className="text-base font-bold text-white">사이트 링크</h3>
                      <p className="text-[10px] text-slate-400">자주 쓰는 업무 포털 및 가이드</p>
                    </div>
                  </div>
                  <button
                    onClick={() => openCreateModal('site')}
                    className="inline-flex items-center justify-center gap-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm transition"
                  >
                    + 추가
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="사이트 검색..."
                    value={siteQuery}
                    onChange={(e) => setSiteQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-800 py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:border-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-600 transition"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>

                {/* Sites Content */}
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((n) => (
                      <div key={n} className="animate-pulse bg-slate-800 rounded-xl p-4 space-y-2">
                        <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                        <div className="h-3 bg-slate-700 rounded w-5/6"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredSites.length > 0 ? (
                  <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                    {filteredSites.map((site) => {
                      const colorMeta = COLOR_MAPS[site.color || 'green'] || COLOR_MAPS.green;
                      return (
                        <div
                          key={site.id}
                          onClick={() => {
                            setSelectedMemo(site);
                            setIsModalOpen(true);
                          }}
                          className={`group flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-800/60 p-3.5 hover:bg-slate-800 transition cursor-pointer`}
                        >
                          <span className="text-xl p-1.5 bg-slate-900 rounded-lg flex-shrink-0">{site.emoji || '🌐'}</span>
                          <div className="overflow-hidden flex-1">
                            <h5 className="text-xs font-bold text-slate-100 group-hover:text-emerald-400 transition truncate">
                              {site.title}
                            </h5>
                            <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 select-none font-mono">
                              {site.siteUrl}
                            </p>
                            {site.content && (
                              <p className="text-[10px] text-slate-400 line-clamp-2 mt-1.5 font-medium bg-slate-900/40 p-1 rounded">
                                {site.content}
                              </p>
                            )}
                          </div>
                          <span className="text-slate-500 group-hover:text-slate-300 self-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl py-12 text-center text-slate-600">
                    <span className="text-2xl mb-1">🔍</span>
                    <p className="text-[10px] font-semibold">등록된 사이트가 없습니다.</p>
                  </div>
                )}
              </div>

              {/* Sidebar Footer */}
              <div className="border-t border-slate-800 pt-4 mt-4 text-[10px] text-slate-500 flex justify-between">
                <span>Total: {filteredSites.length} Links</span>
                <span>실시간 저장 완료</span>
              </div>
            </section>

          </div>
        </div>
      </main>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-3 shadow-lg text-sm font-medium transition-all duration-300 transform translate-y-0 animate-bounce">
          {toast.type === 'success' && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-emerald-400">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
          )}
          {toast.type === 'info' && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-indigo-400">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
            </svg>
          )}
          {toast.type === 'error' && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-rose-400">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
          )}
          {toast.message}
        </div>
      )}

      {/* Unified Form/View Modal */}
      <MemoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMemo(null);
        }}
        memo={selectedMemo}
        onSave={handleSaveMemo}
        onDelete={handleDeleteMemo}
      />
    </div>
  );
}
