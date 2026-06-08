-- 1. memos 테이블 생성
CREATE TABLE public.memos (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('account', 'site')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 테이블 설명 추가 (선택사항)
COMMENT ON TABLE public.memos IS '사내 공용 계정 및 참고 사이트 공유를 위한 메모 테이블';

-- 2. 행 수준 보안 (Row Level Security, RLS) 활성화
ALTER TABLE public.memos ENABLE ROW LEVEL SECURITY;

-- 3. 익명(anonymous) 공개 사용자의 CRUD 권한을 위한 RLS 정책 설정
-- 조회 (SELECT) 허용 정책
CREATE POLICY "Allow public select" 
ON public.memos FOR SELECT 
USING (true);

-- 생성 (INSERT) 허용 정책
CREATE POLICY "Allow public insert" 
ON public.memos FOR INSERT 
WITH CHECK (true);

-- 수정 (UPDATE) 허용 정책
CREATE POLICY "Allow public update" 
ON public.memos FOR UPDATE 
USING (true) 
WITH CHECK (true);

-- 삭제 (DELETE) 허용 정책
CREATE POLICY "Allow public delete" 
ON public.memos FOR DELETE 
USING (true);
