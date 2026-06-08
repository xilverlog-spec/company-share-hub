'use client';

import React, { useState, useEffect } from 'react';
import { Memo } from '@/types';

interface MemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  memo: Memo | null; // If null, we are in Create mode; otherwise View/Edit mode
  onSave: (memoData: { type: 'account' | 'site'; title: string; content: string; id?: string }) => void;
  onDelete: (id: string) => void;
}

export default function MemoModal({ isOpen, onClose, memo, onSave, onDelete }: MemoModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [type, setType] = useState<'account' | 'site'>('account');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  // Sync state when memo changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (memo) {
        setIsEditing(false);
        setType(memo.type);
        setTitle(memo.title);
        setContent(memo.content);
      } else {
        setIsEditing(true); // Create mode is always in editing state
        setType('account');
        setTitle('');
        setContent('');
      }
      setError('');
    }
  }, [isOpen, memo]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      setError('내용을 입력해주세요.');
      return;
    }

    onSave({
      type,
      title: title.trim(),
      content: content.trim(),
      id: memo?.id,
    });
    onClose();
  };

  const handleDelete = () => {
    if (memo && confirm('정말로 이 메모를 삭제하시겠습니까?')) {
      onDelete(memo.id);
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
            {memo ? (isEditing ? '메모 수정' : '상세 보기') : '새 글 작성'}
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
              {/* Type Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">구분</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setType('account')}
                    className={`flex items-center justify-center gap-2 rounded-xl py-3 px-4 border text-sm font-semibold transition ${
                      type === 'account'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-600/10'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    계정 공유
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('site')}
                    className={`flex items-center justify-center gap-2 rounded-xl py-3 px-4 border text-sm font-semibold transition ${
                      type === 'site'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-600/10'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.909 17.909 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
                    </svg>
                    사이트 공유
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">제목</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="제목을 입력하세요"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition"
                />
              </div>

              {/* Content */}
              <div>
                <label htmlFor="content" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">내용</label>
                <textarea
                  id="content"
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="내용을 입력하세요"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition resize-none font-mono text-sm leading-relaxed"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
                {memo && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setError('');
                    }}
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
            <div className="space-y-6">
              {/* Type Pill */}
              <div className="flex items-center gap-3">
                {type === 'account' ? (
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
                {memo && (
                  <span className="text-xs text-slate-400">
                    수정일: {formatDate(memo.updatedAt)}
                  </span>
                )}
              </div>

              {/* Title Display */}
              <div>
                <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                  {title}
                </h2>
              </div>

              {/* Content Display */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <p className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-700 select-text">
                  {content}
                </p>
              </div>

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
