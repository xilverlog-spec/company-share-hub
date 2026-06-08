'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import MemoModal from '@/components/MemoModal';
import { Memo } from '@/types';
import { supabase } from '@/lib/supabase';

// Premium color specification from READ ME.md
const COLOR_MAPS: Record<string, { border: string; bg: string; text: string; lightBg: string; textHover: string; pillBg: string }> = {
  'brand-main': { border: 'border-[#333399]', bg: 'bg-[#333399]', text: 'text-[#333399]', lightBg: 'bg-[#333399]/5', textHover: 'hover:text-[#252573]', pillBg: 'bg-[#333399]/10' },
  'brand-accent': { border: 'border-[#FF5E36]', bg: 'bg-[#FF5E36]', text: 'text-[#FF5E36]', lightBg: 'bg-[#FF5E36]/5', textHover: 'hover:text-[#d33c16]', pillBg: 'bg-[#FF5E36]/10' },
  'brand-cool': { border: 'border-[#b2b2ee]', bg: 'bg-[#B3C5EA]', text: 'text-[#252573]', lightBg: 'bg-[#B3C5EA]/10', textHover: 'hover:text-[#1b1b4d]', pillBg: 'bg-[#B3C5EA]/20' },
  'brand-warm': { border: 'border-[#FCE4D6]', bg: 'bg-[#FCE4D6]', text: 'text-[#b45309]', lightBg: 'bg-[#FCE4D6]/20', textHover: 'hover:text-[#78350f]', pillBg: 'bg-[#FCE4D6]/40' },
  'brand-subBg': { border: 'border-[#DCE4F2]', bg: 'bg-[#DCE4F2]', text: 'text-[#1e3a8a]', lightBg: 'bg-[#DCE4F2]/25', textHover: 'hover:text-[#0f172a]', pillBg: 'bg-[#DCE4F2]/50' },
};

const getColorMeta = (colorName?: string) => {
  const clean = colorName || 'brand-main';
  if (COLOR_MAPS[clean]) return COLOR_MAPS[clean];
  
  // Legacy / fallback mappings
  if (clean === 'blue') return COLOR_MAPS['brand-main'];
  if (clean === 'orange' || clean === 'pink') return COLOR_MAPS['brand-accent'];
  if (clean === 'purple' || clean === 'gray') return COLOR_MAPS['brand-subBg'];
  if (clean === 'green') return COLOR_MAPS['brand-cool'];
  
  return COLOR_MAPS['brand-main'];
};

const LOCAL_STORAGE_KEY = 'company_share_hub_memos';

const INITIAL_MOCK_DATA: Memo[] = [
  {
    id: 'mock-1',
    type: 'account',
    title: 'ChatGPT Plus',
    serviceName: 'ChatGPT',
    planName: 'Plus',
    content: '기획팀 및 개발팀 문서 초안 작성용 공용 계정',
    paymentContent: 'ChatGPT Plus 1개월 이용권 정기 결제',
    billingCycle: 'monthly',
    paymentAmount: '29,000원',
    loginId: 'shared_chatgpt@company.com',
    password: 'superSecretPassword123!',
    currentUser: '김민수',
    extensionNumber: '1001',
    usageStartDate: '2026-06-01',
    usageEndDate: '2026-07-01',
    category: '문서/대화 AI',
    color: 'brand-main',
    emoji: '🤖',
    createdAt: '2026-06-01T08:00:00.000Z',
    updatedAt: '2026-06-08T08:00:00.000Z'
  },
  {
    id: 'mock-2',
    type: 'account',
    title: 'Kling Pro',
    serviceName: 'Kling',
    planName: 'Pro',
    content: '마케팅팀 영상 광고 소스 생성용 계정 (고화질 옵션 사용 가능)',
    paymentContent: 'Kling Pro 영상 제작 전용 요금제',
    billingCycle: 'monthly',
    paymentAmount: '$95',
    loginId: 'marketing_kling@company.com',
    password: 'klingPass456!',
    currentUser: '이영희',
    extensionNumber: '1002',
    usageStartDate: '2026-06-05',
    usageEndDate: '2026-06-14', // Expiry soon! (within 7 days)
    category: '영상 생성',
    color: 'brand-accent',
    emoji: '🎬',
    createdAt: '2026-06-05T09:30:00.000Z',
    updatedAt: '2026-06-08T09:30:00.000Z'
  },
  {
    id: 'mock-3',
    type: 'account',
    title: 'Midjourney Pro',
    serviceName: 'Midjourney',
    planName: 'Pro Plan',
    content: '디자인팀 브랜드 에셋 시안 생성용 계정 (무제한 릴렉스 모드)',
    paymentContent: 'Midjourney Pro 1년 결제분',
    billingCycle: 'yearly',
    paymentAmount: '$576',
    loginId: 'design_midjourney@company.com',
    password: 'midjSecurePass789!',
    currentUser: '박철수',
    extensionNumber: '1003',
    usageStartDate: '2026-01-01',
    usageEndDate: '2026-12-31',
    category: '이미지/디자인',
    color: 'brand-cool',
    emoji: '🎨',
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-06-08T10:00:00.000Z'
  },
  {
    id: 'mock-4',
    type: 'site',
    title: '사내 노션 공유허브 가이드',
    content: '각 AI 프로그램별 업무 활용 정책 및 프롬프트 가이드 모음 문서',
    siteUrl: 'notion.so/company/ai-guide',
    category: '법규/자료',
    color: 'brand-subBg',
    emoji: '📚',
    createdAt: '2026-06-02T12:00:00.000Z',
    updatedAt: '2026-06-08T12:00:00.000Z'
  },
  {
    id: 'mock-5',
    type: 'site',
    title: '국가법령정보센터 (건축법)',
    content: '건축 설계 가이드라인 및 시공 관련 필수 법규 참고 사이트',
    siteUrl: 'law.go.kr',
    category: '법규/자료',
    color: 'brand-warm',
    emoji: '📚',
    createdAt: '2026-06-03T11:00:00.000Z',
    updatedAt: '2026-06-08T11:00:00.000Z'
  },
  {
    id: 'mock-6',
    type: 'site',
    title: 'Figma 디자인 시스템 라이브러리',
    content: '회사 공용 UI/UX 디자인 시스템 에셋 모음 바로가기',
    siteUrl: 'figma.com/file/company-design-system',
    category: '이미지/디자인',
    color: 'brand-cool',
    emoji: '🎨',
    createdAt: '2026-06-04T15:00:00.000Z',
    updatedAt: '2026-06-08T15:00:00.000Z'
  }
];

export default function Home() {
  const [memos, setMemos] = useState<Memo[]>([]);
  
  // Independent searches
  const [accountQuery, setAccountQuery] = useState('');
  const [siteQuery, setSiteQuery] = useState('');

  // Selected Category Filters
  const [selectedAccountCategory, setSelectedAccountCategory] = useState<string>('all');
  const [selectedSiteCategory, setSelectedSiteCategory] = useState<string>('all');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);

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
          currentUser: item.current_user,
          extensionNumber: item.extension_number,
          usageStartDate: item.usage_start_date,
          usageEndDate: item.usage_end_date,
          category: item.category || '기타',
        }));
        setMemos(mapped);
      } else {
        setMemos([]);
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

  // Write/Edit - returns Promise to let the Modal catch errors
  const handleSaveMemo = async (memoData: Partial<Memo> & { type: 'account' | 'site' }) => {
    const payload: any = {
      type: memoData.type,
      title: memoData.title || '',
      content: memoData.content || '',
      emoji: memoData.emoji || (memoData.type === 'account' ? '🔐' : '🌐'),
      color: memoData.color || 'brand-main',
      service_name: memoData.serviceName || '',
      plan_name: memoData.planName || '',
      payment_content: memoData.paymentContent || '',
      billing_cycle: memoData.billingCycle || '',
      payment_amount: memoData.paymentAmount || '',
      login_id: memoData.loginId || '',
      password: memoData.password || '',
      site_url: memoData.siteUrl || '',
      current_user: memoData.currentUser || '',
      extension_number: memoData.extensionNumber || '',
      usage_start_date: memoData.usageStartDate || null,
      usage_end_date: memoData.usageEndDate || null,
      category: memoData.category || '기타',
    };

    try {
      if (memoData.id) {
        // Update mode - EQ ID filter
        const { error } = await supabase
          .from('memos')
          .update(payload)
          .eq('id', memoData.id);

        if (error) throw error;
        showToast('성공적으로 수정되었습니다.', 'success');
      } else {
        // Insert mode - let database generate id, created_at, updated_at
        const { error } = await supabase
          .from('memos')
          .insert(payload);

        if (error) throw error;
        showToast('성공적으로 등록되었습니다.', 'success');
      }
      
      // Reload UI lists
      await fetchMemos();
    } catch (e: any) {
      console.error('Supabase save error details:', e);
      throw e; // rethrow to let the modal catch and display it
    }
  };

  // Delete
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
      console.error('Supabase delete error details:', e);
      showToast(`삭제 실패: ${e?.message || 'DB 에러'}`, 'error');
    }
  };

  // Amount parsing helper to convert currency text to number
  const parseAmount = (amountText?: string): { val: number; currency: 'KRW' | 'USD' } => {
    if (!amountText) return { val: 0, currency: 'KRW' };
    const clean = amountText.replace(/,/g, '').trim();
    
    const isDollar = clean.includes('$') || clean.toLowerCase().includes('usd') || clean.toLowerCase().includes('dollar') || clean.toLowerCase().includes('달러');
    const numMatch = clean.match(/\d+/);
    const val = numMatch ? parseInt(numMatch[0]) : 0;
    
    return { val, currency: isDollar ? 'USD' : 'KRW' };
  };

  // Calculate stats
  const accounts = memos.filter(m => m.type === 'account');
  const sites = memos.filter(m => m.type === 'site');

  const totalProgramsCount = accounts.length;
  const paidProgramsCount = accounts.filter(a => a.billingCycle && a.billingCycle !== 'free' && a.billingCycle !== '').length;

  // Cost sums with Exchange rate ($1 = 1,400원)
  const getEstimatedCosts = () => {
    let monthlyTotal = 0;
    let yearlyTotal = 0;

    accounts.forEach(acc => {
      const { val, currency } = parseAmount(acc.paymentAmount);
      if (val <= 0) return;
      const krwVal = currency === 'USD' ? val * 1400 : val;

      if (acc.billingCycle === 'monthly') {
        monthlyTotal += krwVal;
      } else if (acc.billingCycle === 'yearly') {
        yearlyTotal += krwVal;
      }
    });

    return {
      monthly: monthlyTotal,
      yearly: yearlyTotal + (monthlyTotal * 12)
    };
  };
  
  const { monthly: estMonthlyCost, yearly: estYearlyCost } = getEstimatedCosts();

  // Get Top 3 most expensive accounts to assign Ranking Badges
  const sortedByCost = [...accounts].sort((a, b) => {
    const costA = parseAmount(a.paymentAmount);
    const costB = parseAmount(b.paymentAmount);
    
    const valA = (costA.currency === 'USD' ? costA.val * 1400 : costA.val) * (a.billingCycle === 'yearly' ? 1/12 : 1);
    const valB = (costB.currency === 'USD' ? costB.val * 1400 : costB.val) * (b.billingCycle === 'yearly' ? 1/12 : 1);
    
    return valB - valA;
  });

  const getCostRank = (memoId: string) => {
    const index = sortedByCost.findIndex(m => m.id === memoId);
    if (index === 0) return 'gold';
    if (index === 1) return 'silver';
    if (index === 2) return 'bronze';
    return null;
  };

  // D-Day parsing helpers
  const getDDay = (endDate?: string) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Expiry progress calculation
  const getExpiryProgress = (startDate?: string, endDate?: string) => {
    const daysLeft = getDDay(endDate);
    if (daysLeft === null) return null;

    if (daysLeft < 0) {
      return { percent: 0, label: `만료 (${Math.abs(daysLeft)}일 경과)`, isExpired: true, isUrgent: true };
    }
    if (daysLeft === 0) {
      return { percent: 0, label: 'D-Day', isExpired: false, isUrgent: true };
    }

    let totalDays = 30; // default total cycle
    if (startDate) {
      const start = new Date(startDate);
      const end = new Date(endDate || '');
      const totalTime = end.getTime() - start.getTime();
      if (totalTime > 0) {
        totalDays = Math.ceil(totalTime / (1000 * 60 * 60 * 24));
      }
    }
    const percent = Math.max(0, Math.min(100, (daysLeft / totalDays) * 100));
    return {
      percent,
      label: `D-${daysLeft}`,
      isExpired: false,
      isUrgent: daysLeft <= 7
    };
  };

  // List of accounts with expiration date sorted by D-Day (ascending)
  const expiringServices = accounts
    .filter(a => a.usageEndDate)
    .map(a => ({
      memo: a,
      daysLeft: getDDay(a.usageEndDate) || 999,
      progress: getExpiryProgress(a.usageStartDate, a.usageEndDate)
    }))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  // Filters and Categories lists
  const accountCategories = Array.from(new Set(accounts.map(m => m.category || '기타')));
  const siteCategories = Array.from(new Set(sites.map(m => m.category || '기타')));

  // Account search & filter logic
  const filteredAccounts = accounts
    .filter(memo => {
      if (selectedAccountCategory !== 'all' && (memo.category || '기타') !== selectedAccountCategory) return false;
      if (!accountQuery.trim()) return true;
      const query = accountQuery.toLowerCase();
      return (
        (memo.serviceName || '').toLowerCase().includes(query) ||
        (memo.planName || '').toLowerCase().includes(query) ||
        (memo.loginId || '').toLowerCase().includes(query) ||
        (memo.paymentContent || '').toLowerCase().includes(query) ||
        (memo.currentUser || '').toLowerCase().includes(query) ||
        (memo.category || '').toLowerCase().includes(query)
      );
    });

  // Group accounts by category for categorized layout
  const groupedAccounts: Record<string, Memo[]> = {};
  filteredAccounts.forEach(acc => {
    const cat = acc.category || '기타';
    if (!groupedAccounts[cat]) groupedAccounts[cat] = [];
    groupedAccounts[cat].push(acc);
  });

  // Sort groups by key, and items in group by creation date (latest first)
  Object.keys(groupedAccounts).forEach(cat => {
    groupedAccounts[cat].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  // Site search & filter logic
  const filteredSites = sites
    .filter(memo => {
      if (selectedSiteCategory !== 'all' && (memo.category || '기타') !== selectedSiteCategory) return false;
      if (!siteQuery.trim()) return true;
      const query = siteQuery.toLowerCase();
      return (
        (memo.title || '').toLowerCase().includes(query) ||
        (memo.siteUrl || '').toLowerCase().includes(query) ||
        (memo.content || '').toLowerCase().includes(query) ||
        (memo.category || '').toLowerCase().includes(query)
      );
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Password masking helper for rendering on card
  const displayMaskedPassword = (pwd?: string) => {
    if (!pwd) return '';
    if (pwd.length < 6) return '••••••••';
    const start = pwd.slice(0, 2);
    const end = pwd.slice(-2);
    const masked = '•'.repeat(Math.max(4, pwd.length - 4));
    return `${start}${masked}${end}`;
  };

  const getSiteUrlFormatted = (url?: string) => {
    if (!url) return '';
    let formatted = url.trim();
    if (!/^https?:\/\//i.test(formatted)) {
      formatted = `https://${formatted}`;
    }
    return formatted;
  };

  const openCreateModal = () => {
    setSelectedMemo(null);
    setIsModalOpen(true);
  };

  const openEditModal = (memo: Memo) => {
    setSelectedMemo(memo);
    setIsModalOpen(true);
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Background Glow Nodes */}
      <div className="bg-glow-container">
        <div className="bg-glow-left-top"></div>
        <div className="bg-glow-right-bottom"></div>
      </div>

      <Navbar />

      <main className="flex-1 py-8 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Supabase Disconnected Warning Banner */}
          {!isEnvConfigured && (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50/90 p-4.5 text-xs text-rose-800 shadow-sm flex items-center gap-3 backdrop-blur-md animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0 text-rose-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <span className="font-bold">Supabase 환경변수 연결 설정 필요:</span> 
                <span className="text-rose-700 ml-1">루트 경로의 `.env.local` 파일에서 Supabase URL과 Anon Key 설정을 진행한 뒤 앱을 이용해 주세요.</span>
              </div>
            </div>
          )}

          {/* AI SUBSCRIPTION SUMMARY DASHBOARD (AI 유료결제 현황판) */}
          <section className="glass-panel rounded-3xl p-6 mb-8">
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>📊</span> AI 유료결제 실시간 현황판
            </h3>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Stat card 1 */}
              <div className="bg-gradient-to-br from-[#333399]/10 to-white/95 rounded-2xl p-5 border border-[#333399]/20 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[110px] transition hover:shadow-sm">
                <span className="text-xs font-bold text-slate-500">전체 유료결제사이트</span>
                <span className="text-3xl font-extrabold text-[#333399] tracking-tight mt-1">{totalProgramsCount}개</span>
                <span className="text-[10px] text-slate-400 mt-2 block">공유 허브 등록 기준</span>
              </div>

              {/* Stat card 2 */}
              <div className="bg-gradient-to-br from-[#FF5E36]/10 to-white/95 rounded-2xl p-5 border border-[#FF5E36]/20 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[110px] transition hover:shadow-sm">
                <span className="text-xs font-bold text-slate-500">구독 중인 서비스</span>
                <span className="text-3xl font-extrabold text-[#FF5E36] tracking-tight mt-1">{paidProgramsCount}개</span>
                <span className="text-[10px] text-slate-400 mt-2 block">무료 플랜 제외</span>
              </div>

              {/* Stat card 3 */}
              <div className="bg-gradient-to-br from-[#B3C5EA]/20 to-white/95 rounded-2xl p-5 border border-[#B3C5EA]/25 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[110px] transition hover:shadow-sm">
                <span className="text-xs font-bold text-slate-500">월 예상 결제액</span>
                <span className="text-2xl font-extrabold text-slate-800 tracking-tight mt-1.5">{estMonthlyCost.toLocaleString()}원</span>
                <span className="text-[10px] text-slate-400 mt-2 block">1$ = 1,400원 환산 기준</span>
              </div>

              {/* Stat card 4 */}
              <div className="bg-gradient-to-br from-[#FCE4D6]/30 to-white/95 rounded-2xl p-5 border border-[#FCE4D6]/35 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[110px] transition hover:shadow-sm">
                <span className="text-xs font-bold text-slate-500">연 예상 결제액</span>
                <span className="text-2xl font-extrabold text-slate-800 tracking-tight mt-1.5">{estYearlyCost.toLocaleString()}원</span>
                <span className="text-[10px] text-slate-400 mt-2 block">월 정기 구독 포함 총합</span>
              </div>
            </div>

            {/* USAGE EXPIRATION PROGRESS GRAPH (사용만료기한 그래프) */}
            {expiringServices.length > 0 && (
              <div className="mt-6 pt-5 border-t border-slate-200/50">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">⏳ 서비스 사용 만료 기한 그래프</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {expiringServices.slice(0, 4).map(({ memo: item, progress }) => {
                    if (!progress) return null;
                    return (
                      <div key={item.id} className="bg-white/60 rounded-xl p-3.5 border border-white/40 shadow-xs flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5 w-1/3 truncate">
                          <span className="text-lg flex-shrink-0">{item.emoji || '🔐'}</span>
                          <span className="text-xs font-bold text-slate-700 truncate">{item.serviceName || item.title}</span>
                        </div>
                        
                        {/* Gauge bar */}
                        <div className="flex-1 flex items-center gap-2.5">
                          <div className="w-full bg-slate-200/60 rounded-full h-2 overflow-hidden border border-slate-100">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                progress.isUrgent ? 'bg-[#FF5E36]' : 'bg-[#333399]'
                              }`}
                              style={{ width: `${progress.percent}%` }}
                            />
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                            progress.isUrgent 
                              ? 'bg-rose-50 text-[#FF5E36] border border-rose-100 font-mono animate-pulse'
                              : 'bg-indigo-50 text-[#333399] border border-indigo-100 font-mono'
                          }`}>
                            {progress.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* MAIN 2-COLUMN SPLIT GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Account Sharing Dashboard (Col Span 8) */}
            <section className="lg:col-span-8 space-y-6">
              
              {/* Filter, Search and Toolbar */}
              <div className="glass-panel rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">💳</span>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">유료결제사이트</h3>
                    <p className="text-[10px] text-slate-400 font-semibold">사내 공용 유료 서비스 및 접속 정보</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Category Filter */}
                  <select
                    value={selectedAccountCategory}
                    onChange={(e) => setSelectedAccountCategory(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white/70 py-1.5 px-3 text-xs text-slate-700 font-semibold focus:border-indigo-400 focus:outline-none transition"
                  >
                    <option value="all">모든 카테고리</option>
                    {accountCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  {/* Search Bar */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="유료결제사이트 검색..."
                      value={accountQuery}
                      onChange={(e) => setAccountQuery(e.target.value)}
                      className="w-full sm:w-44 rounded-xl border border-slate-200 bg-white/70 py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:outline-none transition"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </div>

                  <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-1 rounded-xl bg-[#333399] hover:bg-[#252573] px-4 py-1.5 text-xs font-bold text-white shadow-md transition"
                  >
                    + 유료결제사이트 등록
                  </button>
                </div>
              </div>

              {/* Categorized Accounts List */}
              {isLoading ? (
                /* Premium skeleton loaders */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map((n) => (
                    <div key={n} className="animate-pulse bg-white/60 rounded-2xl p-5 space-y-3 border border-white/60 h-44 shadow-xs">
                      <div className="h-5 bg-slate-200 rounded w-1/3"></div>
                      <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                      <div className="h-8 bg-slate-50 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : Object.keys(groupedAccounts).length > 0 ? (
                <div className="space-y-8">
                  {Object.keys(groupedAccounts).map((catName) => (
                    <div key={catName} className="space-y-4">
                      {/* Category Title Header */}
                      <div className="flex items-center gap-2 border-b border-slate-200/50 pb-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">📂</span>
                        <h4 className="text-sm font-bold text-slate-700">{catName}</h4>
                        <span className="text-[10px] font-bold text-slate-400 font-mono">({groupedAccounts[catName].length})</span>
                      </div>

                      {/* Grid of Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {groupedAccounts[catName].map((account) => {
                          const colorMeta = getColorMeta(account.color);
                          const rank = getCostRank(account.id);
                          const dDayVal = getDDay(account.usageEndDate);

                          return (
                            <div
                              key={account.id}
                              onClick={() => openEditModal(account)}
                              className="premium-card relative p-5 flex flex-col justify-between overflow-hidden cursor-pointer"
                            >
                              {/* Left Accent Stripe */}
                              <div className={`absolute left-0 top-0 bottom-0 w-1 ${colorMeta.bg}`} />

                              {/* Ranking badges */}
                              {rank && (
                                <div className="absolute top-0 right-4 flex items-center">
                                  {rank === 'gold' && (
                                    <div 
                                      className="text-[10px] font-bold text-white px-2.5 py-0.5 rounded-b-md shadow-md"
                                      style={{ background: 'linear-gradient(135deg, #FFB800 0%, #FF8A00 100%)', boxShadow: '0 2px 8px rgba(255, 184, 0, 0.4)' }}
                                    >
                                      🥇 1st Cost
                                    </div>
                                  )}
                                  {rank === 'silver' && (
                                    <div 
                                      className="text-[10px] font-bold text-white px-2.5 py-0.5 rounded-b-md shadow-md"
                                      style={{ background: 'linear-gradient(135deg, #94A3B8 0%, #64748B 100%)', boxShadow: '0 2px 8px rgba(148, 163, 184, 0.4)' }}
                                    >
                                      🥈 2nd Cost
                                    </div>
                                  )}
                                  {rank === 'bronze' && (
                                    <div 
                                      className="text-[10px] font-bold text-white px-2.5 py-0.5 rounded-b-md shadow-md"
                                      style={{ background: 'linear-gradient(135deg, #B45309 0%, #78350F 100%)', boxShadow: '0 2px 8px rgba(180, 83, 9, 0.4)' }}
                                    >
                                      🥉 3rd Cost
                                    </div>
                                  )}
                                </div>
                              )}

                              <div>
                                {/* Card top rows */}
                                <div className="flex items-center justify-between mb-3.5">
                                  <span className="text-2xl p-1.5 bg-slate-50 border border-slate-100 rounded-xl shadow-xs">{account.emoji || '🔐'}</span>
                                  <div className="flex gap-1.5 items-center">
                                    {/* D-Day badge on card */}
                                    {dDayVal !== null && (
                                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                                        dDayVal < 0 
                                          ? 'bg-rose-50 text-[#FF5E36]'
                                          : dDayVal <= 7
                                            ? 'bg-amber-50 text-amber-600 animate-pulse'
                                            : 'bg-indigo-50 text-[#333399]'
                                      }`}>
                                        {dDayVal < 0 ? '만료됨' : dDayVal === 0 ? 'D-Day' : `D-${dDayVal}`}
                                      </span>
                                    )}
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${colorMeta.text} ${colorMeta.pillBg}`}>
                                      {account.planName || '공용 계정'}
                                    </span>
                                  </div>
                                </div>

                                {/* Service name & description */}
                                <h4 className="text-base font-bold text-slate-800 transition-colors group-hover:text-indigo-600 mb-1.5">
                                  {account.serviceName || account.title}
                                </h4>
                                
                                {account.content && (
                                  <p className="text-[11px] text-slate-400 line-clamp-1 mb-3">
                                    {account.content}
                                  </p>
                                )}

                                {/* Masked credentials block */}
                                <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs font-mono mb-3">
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">ID:</span>
                                    <span className="font-bold text-slate-700 truncate max-w-[160px]">{account.loginId}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">PW:</span>
                                    <span className="font-bold text-slate-700">{displayMaskedPassword(account.password)}</span>
                                  </div>
                                </div>

                                {/* Current User display with inner line */}
                                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                                  <span className="flex items-center gap-1">
                                    👤 사용자: <strong className="text-slate-800">{account.currentUser || '미지정'}</strong>
                                  </span>
                                  {account.extensionNumber && (
                                    <span className="text-slate-400 font-mono">내선: {account.extensionNumber}</span>
                                  )}
                                </div>

                                {/* Cost & cycle info */}
                                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                                  <span>💳</span>
                                  <span>
                                    {account.paymentAmount ? `${account.paymentAmount}` : '금액 정보 없음'}
                                    {account.billingCycle === 'yearly' ? ' (연)' : account.billingCycle === 'monthly' ? ' (월)' : ''}
                                  </span>
                                </div>
                              </div>

                              {/* View detail hover action trigger */}
                              <div className="mt-4 flex items-center justify-end text-[10px] font-bold text-[#333399] opacity-70 hover:opacity-100 transition">
                                접속 정보 보기
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3 ml-0.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                </svg>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center border border-dashed border-slate-200/80 rounded-2xl py-16 text-center text-slate-400 bg-white/50 backdrop-blur-md">
                  <span className="text-4xl mb-3">🔍</span>
                  <p className="text-xs font-bold">검색 결과에 맞는 등록된 유료결제사이트가 없습니다.</p>
                </div>
              )}
            </section>

            {/* RIGHT COLUMN: Site Reference Column Dashboard (Col Span 4) */}
            <section className="lg:col-span-4 glass-panel rounded-3xl p-6 shadow-md flex flex-col justify-between min-h-[70vh] text-slate-800">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-5 border-b border-slate-200/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🌐</span>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-800">유용한 사이트 공유</h3>
                      <p className="text-[9px] text-slate-400 font-semibold">사내 유용한 바로가기 Window</p>
                    </div>
                  </div>
                  <button
                    onClick={openCreateModal}
                    className="inline-flex items-center justify-center gap-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-[10px] font-bold text-white shadow-xs transition"
                  >
                    + 유용한 사이트 추가
                  </button>
                </div>

                {/* Filter and Search */}
                <div className="space-y-2 mb-4">
                  {/* Category select */}
                  <select
                    value={selectedSiteCategory}
                    onChange={(e) => setSelectedSiteCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white/70 py-1.5 px-3 text-[11px] text-slate-700 font-semibold focus:border-emerald-500 focus:outline-none transition"
                  >
                    <option value="all">모든 카테고리</option>
                    {siteCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  {/* Search text box */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="유용한 사이트 검색..."
                      value={siteQuery}
                      onChange={(e) => setSiteQuery(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white/70 py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none transition"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </div>
                </div>

                {/* Sites Content */}
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((n) => (
                      <div key={n} className="animate-pulse bg-white/60 rounded-xl p-4 space-y-2 border border-white/60">
                        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                        <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredSites.length > 0 ? (
                  <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                    {filteredSites.map((site) => {
                      const colorMeta = getColorMeta(site.color);

                      return (
                        <div
                          key={site.id}
                          onClick={() => openEditModal(site)}
                          className="group relative flex items-start gap-3 rounded-xl border border-slate-200/50 bg-white/70 p-3.5 hover:bg-white transition cursor-pointer shadow-xs"
                        >
                          <span className="text-xl p-1.5 bg-slate-50 rounded-lg flex-shrink-0 border border-slate-100 shadow-xs">{site.emoji || '🌐'}</span>
                          <div className="overflow-hidden flex-1">
                            <div className="flex items-center gap-1.5 justify-between">
                              <h5 className="text-xs font-bold text-slate-800 group-hover:text-[#333399] transition truncate">
                                {site.title}
                              </h5>
                              {site.category && (
                                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                                  {site.category}
                                </span>
                              )}
                            </div>
                            
                            {site.content && (
                              <p className="text-[10px] text-slate-500 line-clamp-2 mt-1.5 font-medium bg-slate-50 p-1.5 rounded border border-slate-100">
                                {site.content}
                              </p>
                            )}

                            {/* '바로가기' 버튼 구성 (URL 텍스트 노출 안 함) */}
                            {site.siteUrl && (
                              <div className="mt-2.5">
                                <a
                                  href={getSiteUrlFormatted(site.siteUrl)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()} // 상세 팝업 열기 방지
                                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1 text-[10px] font-bold text-white shadow-xs transition"
                                >
                                  바로가기
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-2.5 h-2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                  </svg>
                                </a>
                              </div>
                            )}
                          </div>
                          
                          <span className="text-slate-400 group-hover:text-slate-600 self-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl py-14 text-center text-slate-400 bg-white/50 backdrop-blur-md">
                    <span className="text-2xl mb-1">🔍</span>
                    <p className="text-[10px] font-semibold">등록된 유용한 사이트가 없습니다.</p>
                  </div>
                )}
              </div>

              {/* Sidebar Footer */}
              <div className="border-t border-slate-200/50 pt-4 mt-5 text-[10px] text-slate-400 flex justify-between">
                <span>Total: {filteredSites.length} Links</span>
                <span>실시간 동기화 완료</span>
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
