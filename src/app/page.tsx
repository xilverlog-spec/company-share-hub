'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import MemoModal from '@/components/MemoModal';
import { Memo } from '@/types';
import { supabase } from '@/lib/supabase';

const MOCK_MEMOS: Memo[] = [
  {
    id: 'mock-1',
    type: 'account',
    title: '[데모] Figma 디자인 공용 계정',
    content: '아이디: design-public@company.com\n비밀번호: CompanyFigma2026!\n\n※ Supabase 연동 시 이 데모 데이터는 실시간 DB 정보로 교체됩니다.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'mock-2',
    type: 'site',
    title: '[데모] 사내 UI/UX 컴포넌트 가이드라인 및 웹 규격',
    content: '주소: https://guide.internal.company.com\n\n공식 사내 디자인 규격 및 프론트엔드 컴포넌트 사용 안내서입니다. .env.local 설정 후 이용해 주세요.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
];

export default function Home() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [selectedTab, setSelectedTab] = useState<'all' | 'account' | 'site'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnvConfigured, setIsEnvConfigured] = useState(true);

  // Check if env vars are present
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key || url.includes('YOUR_SUPABASE') || key.includes('YOUR_SUPABASE')) {
      setIsEnvConfigured(false);
    }
  }, []);

  // Fetch memos from Supabase
  const fetchMemos = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('memos')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        const mapped: Memo[] = data.map((item: any) => ({
          id: item.id,
          type: item.type as 'account' | 'site',
          title: item.title,
          content: item.content,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        }));
        setMemos(mapped);
      }
    } catch (e) {
      console.error('Failed to fetch from Supabase. Falling back to demo/mock data.', e);
      // Fallback to mock data if DB read fails
      setMemos(MOCK_MEMOS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMemos();
  }, []);

  // Toast auto-dismissal
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  // Create or update memo
  const handleSaveMemo = async (memoData: { type: 'account' | 'site'; title: string; content: string; id?: string }) => {
    const now = new Date().toISOString();
    const id = memoData.id || Math.random().toString(36).substring(2, 9);

    if (!isEnvConfigured) {
      // Local fallback edit
      if (memoData.id) {
        setMemos(memos.map(item => item.id === memoData.id ? { ...item, ...memoData, updatedAt: now } : item));
        showToast('[데모] 메모가 임시 수정되었습니다.', 'success');
      } else {
        const newItem: Memo = { id, ...memoData, createdAt: now, updatedAt: now };
        setMemos([newItem, ...memos]);
        showToast('[데모] 새 메모가 임시 등록되었습니다.', 'success');
      }
      return;
    }

    try {
      // type 값은 반드시 'account' 또는 'site'여야 함
      if (memoData.type !== 'account' && memoData.type !== 'site') {
        throw new Error("유효하지 않은 구분 타입입니다 ('account' 또는 'site'만 허용됩니다).");
      }

      const payload = {
        type: memoData.type,
        title: memoData.title,
        content: memoData.content,
      };

      if (memoData.id) {
        // 수정 (Update)
        const { error } = await supabase
          .from('memos')
          .update(payload)
          .eq('id', memoData.id);

        if (error) throw error;
        showToast('메모가 수정되었습니다.', 'success');
      } else {
        // 새 글 생성 (Insert) - id, created_at, updated_at은 제외하고 전송
        const { error } = await supabase
          .from('memos')
          .insert(payload);

        if (error) throw error;
        showToast('새 메모가 등록되었습니다.', 'success');
      }

      // 저장 성공 후 Supabase에서 memos 목록을 다시 fetch해서 화면에 반영
      await fetchMemos();
    } catch (e: any) {
      // 브라우저 콘솔과 터미널 로그에 실제 Supabase 오류가 출력되도록 처리
      console.error('Error saving memo to Supabase:', e);
      // 저장 실패 시 브라우저 화면에 Supabase error.message 표시
      const errorMsg = e?.message || '알 수 없는 DB 오류가 발생했습니다.';
      showToast(`저장 실패: ${errorMsg}`, 'error');
    }
  };

  // Delete memo
  const handleDeleteMemo = async (id: string) => {
    if (!isEnvConfigured) {
      setMemos(memos.filter(item => item.id !== id));
      showToast('[데모] 메모가 임시 삭제되었습니다.', 'info');
      return;
    }

    try {
      const { error } = await supabase
        .from('memos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showToast('메모가 삭제되었습니다.', 'info');
      await fetchMemos();
    } catch (e: any) {
      console.error('Error deleting memo from Supabase:', e);
      const errorMsg = e?.message || '알 수 없는 DB 오류가 발생했습니다.';
      showToast(`삭제 실패: ${errorMsg}`, 'error');
    }
  };

  // Filter & Search Memos
  const filteredMemos = memos.filter((memo) => {
    if (selectedTab !== 'all' && memo.type !== selectedTab) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchTitle = memo.title.toLowerCase().includes(query);
      const matchContent = memo.content.toLowerCase().includes(query);
      return matchTitle || matchContent;
    }
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 60) {
      return `${diffMins || 1}분 전`;
    } else if (diffHours < 24) {
      return `${diffHours}시간 전`;
    } else {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Environment variables warning banner */}
          {!isEnvConfigured && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold">Supabase 환경변수가 설정되지 않았습니다.</p>
                  <p className="text-xs text-amber-700 mt-0.5">현재 데모 모드(임시 메모리 작동)로 작동 중입니다. 프로젝트 루트의 <code className="bg-amber-100/80 px-1.5 py-0.5 rounded font-mono font-bold">.env.local</code> 파일을 작성하고 서버를 재시작해주세요.</p>
                </div>
              </div>
            </div>
          )}

          {/* Dashboard Header Options */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
            
            {/* Left: Tab selection */}
            <div className="flex space-x-1 rounded-xl bg-slate-100 p-1 self-start shadow-sm border border-slate-200/50">
              <button
                onClick={() => setSelectedTab('all')}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  selectedTab === 'all'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setSelectedTab('account')}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  selectedTab === 'account'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                계정 공유
              </button>
              <button
                onClick={() => setSelectedTab('site')}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  selectedTab === 'site'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                사이트 공유
              </button>
            </div>

            {/* Right: Search + Create Post */}
            <div className="flex flex-col sm:flex-row gap-3 md:items-center">
              
              {/* Search Field */}
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="제목 및 내용 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 shadow-sm transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Create Button */}
              <button
                onClick={() => {
                  setSelectedMemo(null);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-slate-800 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                새 글 작성
              </button>

            </div>
          </div>

          {/* Skeleton Loaders */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="animate-pulse rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="h-6 w-20 bg-slate-200 rounded-full"></div>
                    <div className="h-4 w-12 bg-slate-100 rounded"></div>
                  </div>
                  <div className="h-5 w-3/4 bg-slate-200 rounded"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-100 rounded"></div>
                    <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                  </div>
                  <div className="h-4 w-16 bg-slate-100 rounded ml-auto"></div>
                </div>
              ))}
            </div>
          ) : filteredMemos.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMemos.map((memo) => (
                <div
                  key={memo.id}
                  onClick={() => {
                    setSelectedMemo(memo);
                    setIsModalOpen(true);
                  }}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer"
                >
                  <div>
                    {/* Badge */}
                    <div className="flex items-center justify-between mb-4">
                      {memo.type === 'account' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                          계정 공유
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-700/10">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.909 17.909 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
                          </svg>
                          사이트 공유
                        </span>
                      )}
                      
                      <span className="text-xs text-slate-400 group-hover:text-slate-600 transition duration-200">
                        {formatDate(memo.updatedAt)}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors duration-200 mb-2 line-clamp-1">
                      {memo.title}
                    </h4>

                    {/* Preview Content */}
                    <p className="text-sm text-slate-500 line-clamp-3 font-mono leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100/50 select-none">
                      {memo.content}
                    </p>
                  </div>

                  {/* Detail Link Prompt */}
                  <div className="mt-4 flex items-center justify-end text-xs font-semibold text-slate-400 group-hover:text-slate-900 transition duration-200">
                    상세보기
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16 px-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-900">등록된 글이 없습니다.</h3>
              <p className="mt-1 text-sm text-slate-500">
                {searchQuery ? '검색어와 일치하는 공유 메모가 없습니다.' : '첫 번째 공유 메모를 작성해보세요!'}
              </p>
              <div className="mt-6">
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
                  >
                    검색 초기화
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedMemo(null);
                      setIsModalOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-slate-800 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    첫 메모 작성
                  </button>
                )}
              </div>
            </div>
          )}

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

      {/* Memo Modal */}
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
