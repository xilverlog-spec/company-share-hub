'use client';

import React, { useState, useEffect } from 'react';
import { Memo } from '@/types';

interface MemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  memo: Memo | null;
  onSave: (memoData: Partial<Memo> & { type: 'account' | 'site' }) => Promise<void>;
  onDelete: (id: string) => void;
}

// Premium color specification from READ ME.md
const COLORS = [
  { name: 'brand-main', label: '메인 퍼플', border: 'border-[#333399]', bg: 'bg-[#333399]', text: 'text-[#333399]', bgLight: 'bg-[#333399]/10' },
  { name: 'brand-accent', label: '코랄 오렌지', border: 'border-[#FF5E36]', bg: 'bg-[#FF5E36]', text: 'text-[#FF5E36]', bgLight: 'bg-[#FF5E36]/10' },
  { name: 'brand-cool', label: '쿨톤 블루', border: 'border-[#B3C5EA]', bg: 'bg-[#B3C5EA]', text: 'text-[#B3C5EA]', bgLight: 'bg-[#B3C5EA]/10' },
  { name: 'brand-warm', label: '웜톤 베이지', border: 'border-[#FCE4D6]', bg: 'bg-[#FCE4D6]', text: 'text-[#FCE4D6]', bgLight: 'bg-[#FCE4D6]/10' },
  { name: 'brand-subBg', label: '아이스 블루', border: 'border-[#DCE4F2]', bg: 'bg-[#DCE4F2]', text: 'text-[#DCE4F2]', bgLight: 'bg-[#DCE4F2]/10' },
];

const EMOJIS = ['🔐', '🤖', '🎬', '🎨', '📚', '🌐', '🛠️', '💳', '🎵', '🤝', '🔥', '💻'];

// Employee extensions data list
const EMPLOYEES = [
  { name: '허동윤', extension: '1541' },
  { name: '김삼남', extension: '1513' },
  { name: '김창수', extension: '1590' },
  { name: '오철호', extension: '1511' },
  { name: '이한석', extension: '0079' },
  { name: '천준호', extension: '1606' },
  { name: '최호보', extension: '1500' },
  { name: '박주열', extension: '0083' },
  { name: '이길근', extension: '1543' },
  { name: '이덕환', extension: '1535' },
  { name: '이상익', extension: '1508' },
  { name: '채훈', extension: '0087' },
  { name: '이재훈', extension: '1624' },
  { name: '김연규', extension: '1660' },
  { name: '김가향', extension: '1502' },
  { name: '김윤종', extension: '1530' },
  { name: '서승환', extension: '1504' },
  { name: '김정훈', extension: '0088' },
  { name: '이지원', extension: '1501' },
  { name: '김주현', extension: '1503' },
  { name: '박창석', extension: '1520' },
  { name: '이소정', extension: '1527' },
  { name: '고영란', extension: '1528' },
  { name: '서동하', extension: '1529' },
  { name: '김혜진', extension: '1526' },
  { name: '하경옥', extension: '1549' },
  { name: '허희연', extension: '1551' },
  { name: '김동혁', extension: '1540' },
  { name: '김규식', extension: '0009' },
  { name: '김동섭', extension: '1592' },
  { name: '권나현', extension: '0057' },
  { name: '김세이', extension: '0056' },
  { name: '김태진', extension: '0049' },
  { name: '조혜림', extension: '1577' },
  { name: '김승현', extension: '1564' },
  { name: '박혜원', extension: '0089' },
  { name: '유미래', extension: '1582' },
  { name: '정승우', extension: '1569' },
  { name: '황아름', extension: '1547' },
  { name: '김윤정', extension: '1596' },
  { name: '김주영', extension: '0086' },
  { name: '백지민', extension: '0014' },
  { name: '조하연', extension: '0093' },
  { name: '이지혜', extension: '0071' },
  { name: '임수민', extension: '1545' },
  { name: '조창현', extension: '0070' },
  { name: '배수진', extension: '0027' },
  { name: '윤정아', extension: '1567' },
  { name: '이광택', extension: '1539' },
  { name: '이승민', extension: '1573' },
  { name: '홍남기', extension: '0046' },
  { name: '강주희', extension: '1595' },
  { name: '김현재', extension: '1523' },
  { name: '전연실', extension: '0090' },
  { name: '노희영', extension: '0068' },
  { name: '박거성', extension: '0063' },
  { name: '한호림', extension: '2070' },
  { name: '전원대', extension: '2067' },
  { name: '하영현', extension: '1584' },
  { name: '박수빈', extension: '0085' },
  { name: '이지원', extension: '0052' },
  { name: '전미소', extension: '1579' },
  { name: '최치원', extension: '0095' },
  { name: '하지원', extension: '0048' },
  { name: '김태강', extension: '0072' },
  { name: '김소영', extension: '1578' },
  { name: '김관호', extension: '0053' },
  { name: '정애랑', extension: '0044' },
  { name: '한송이', extension: '1538' },
  { name: '박정민', extension: '0019' },
  { name: '이지유', extension: '1561' },
  { name: '임성섭', extension: '0039' },
  { name: '정지은', extension: '0050' },
  { name: '현기업', extension: '0015' },
  { name: '김진현', extension: '0025' },
  { name: '백승연', extension: '0084' },
  { name: '정진우', extension: '0018' },
  { name: '최재원', extension: '0035' },
  { name: '김동균', extension: '0032' },
  { name: '정주연', extension: '1599' },
  { name: '강동훈', extension: '0054' },
  { name: '김민정', extension: '0047' },
  { name: '안주연', extension: '0055' },
  { name: '김민선', extension: '1591' },
  { name: '유성애', extension: '1558' },
  { name: '권보람', extension: '0059' },
  { name: '금지연', extension: '0061' },
  { name: '모영준', extension: '0092' },
  { name: '유진찬', extension: '0065' },
  { name: '김민지', extension: '0069' },
  { name: '최지아', extension: '1594' },
  { name: '손정민', extension: '0078' },
  { name: '박미경', extension: '1570' },
  { name: '김이훈', extension: '0021' },
  { name: '오지희', extension: '1524' },
  { name: '이솔뫼', extension: '0062' },
  { name: '이아람', extension: '1534' },
  { name: '이영훈', extension: '1531' },
  { name: '추우영', extension: '1512' },
  { name: '박혜은', extension: '0006' },
  { name: '최병찬', extension: '0033' },
  { name: '최승민', extension: '1555' },
  { name: '김기영', extension: '1533' },
  { name: '박소윤', extension: '1571' },
  { name: '김경민', extension: '1588' },
  { name: '권현정', extension: '0043' },
  { name: '조호진', extension: '1560' },
  { name: '황수진', extension: '0037' },
  { name: '구은진', extension: '0016' },
  { name: '진성봉', extension: '0007' },
  { name: '윤한홍', extension: '1589' },
  { name: '전기형', extension: '1593' },
  { name: '현준섭', extension: '1572' },
  { name: '안재철', extension: '0036' },
  { name: '강신우', extension: '0023' },
  { name: '신지원', extension: '0024' },
  { name: '강학귀', extension: '0022' },
  { name: '윤다현', extension: '0077' },
  { name: '공민지', extension: '1557' },
  { name: '김승일', extension: '0020' },
  { name: '이대풍', extension: '0029' },
  { name: '오수진', extension: '0096' },
  { name: '김기학', extension: '1510' },
  { name: '임정식', extension: '1585' },
  { name: '양시우', extension: '1587' },
  { name: '천윤영', extension: '1521' },
  { name: '김승만', extension: '0075' },
  { name: '한영근', extension: '0026' },
  { name: '안수정', extension: '0073' },
  { name: '김상원', extension: '1585' },
  { name: '조규현', extension: '0003' },
  { name: '박홍태', extension: '1522' },
  { name: '장진수', extension: '0001' },
  { name: '조은영', extension: '1532' },
  { name: '고아영', extension: '1580' },
  { name: '이영준', extension: '1516' },
  { name: '이용희', extension: '1514' },
  { name: '김지혜', extension: '1515' },
  { name: '김성하', extension: '0076' },
  { name: '이종근', extension: '1518' },
  { name: '김경원', extension: '1510' },
  { name: '이승빈', extension: '1517' },
  { name: '김종복', extension: '0074' },
  { name: '차문송', extension: '1548' },
  { name: '하규진', extension: '0051' },
  { name: '김일군', extension: '0004' },
  { name: '강수진', extension: '0076' },
  { name: '김태관', extension: '1604' },
  { name: '유성균', extension: '1644' },
  { name: '임슬기', extension: '1645' },
  { name: '김재은', extension: '1900' },
  { name: '홍성필', extension: '1619' },
  { name: '박희태', extension: '1626' },
  { name: '조미선', extension: '1646' },
  { name: '송민경', extension: '1656' },
  { name: '임은주', extension: '1640' },
  { name: '조형민', extension: '1665' },
  { name: '최석순', extension: '1647' },
  { name: '한현석', extension: '1694' },
  { name: '김민지', extension: '1686' },
  { name: '김용진', extension: '1911' },
  { name: '이한수', extension: '1933' },
  { name: '맹진규', extension: '1699' },
  { name: '박소현', extension: '1696' },
  { name: '오소은', extension: '1691' },
  { name: '윤주능', extension: '1689' },
  { name: '정상천', extension: '1659' },
  { name: '김동헌', extension: '1642' },
  { name: '김종숙', extension: '1621' },
  { name: '김종욱', extension: '1608' },
  { name: '정진성', extension: '1632' },
  { name: '류건희', extension: '1652' },
  { name: '신지연', extension: '1612' },
  { name: '이민성', extension: '1664' },
  { name: '이승현', extension: '1657' },
  { name: '황선혜', extension: '1654' },
  { name: '신광섭', extension: '1661' },
  { name: '권유수', extension: '1914' },
  { name: '김수현', extension: '1916' },
  { name: '김신아', extension: '1917' },
  { name: '김태겸', extension: '1918' },
  { name: '박은휘', extension: '1653' },
  { name: '배현재', extension: '1919' },
  { name: '안영은', extension: '1685' },
  { name: '우혜진', extension: '1687' },
  { name: '이수찬', extension: '1688' },
  { name: '최주현', extension: '1912' },
  { name: '최지인', extension: '1662' },
  { name: '권희지', extension: '1663' },
  { name: '김성민', extension: '1684' },
  { name: '방다은', extension: '1928' },
  { name: '서은영', extension: '1924' },
  { name: '양가이', extension: '1934' },
  { name: '양호진', extension: '1679' },
  { name: '이찬희', extension: '1666' },
  { name: '임민희', extension: '1680' },
  { name: '정현준', extension: '1698' },
  { name: '추준서', extension: '1695' },
  { name: '천용화', extension: '1618' },
  { name: '김헌구', extension: '1617' },
  { name: '김판원', extension: '1620' },
  { name: '서용규', extension: '1616' },
  { name: '문하정', extension: '1683' },
  { name: '이지혜', extension: '1690' },
  { name: '이초원', extension: '1932' },
  { name: '구승주', extension: '1668' },
  { name: '김서현', extension: '1673' },
  { name: '박찬희', extension: '1921' },
  { name: '안서현', extension: '1931' },
  { name: '이가영', extension: '1678' },
  { name: '이정훈', extension: '1681' },
  { name: '조나림', extension: '1655' },
  { name: '허성무', extension: '1643' },
  { name: '김한준', extension: '1675' },
  { name: '이재한', extension: '1676' },
  { name: '주시현', extension: '1635' }
];

// Keywords mapping helper for emoji & category recommendation
const recommendEmojiAndCategory = (name: string, desc: string): { emoji?: string; category?: string } => {
  const text = `${name} ${desc}`.toLowerCase();
  let emoji: string | undefined;
  let category: string | undefined;

  if (/kling|runway|video|영상|비디오|youtube|유튜브/i.test(text)) {
    emoji = '🎬';
    category = '영상 생성';
  } else if (/chatgpt|gpt|claude|gemini|deepseek|대화|ai|chatbot/i.test(text)) {
    emoji = '🤖';
    category = '문서/대화 AI';
  } else if (/midjourney|canva|figma|이미지|디자인|캔바|photo|art|그림/i.test(text)) {
    emoji = '🎨';
    category = '이미지/디자인';
  } else if (/suno|음악|음원|소리|music|audio/i.test(text)) {
    emoji = '🎵';
    category = '음악 생성';
  } else if (/법령|건축|자료|문서|법률|법규|특허|도서|가이드/i.test(text)) {
    emoji = '📚';
    category = '법규/자료';
  } else if (/github|aws|vercel|개발|도구|system|코드|api|🛠️|tool/i.test(text)) {
    emoji = '🛠️';
    category = '개발 도구';
  } else if (/site|사이트|링크|web|웹|portal/i.test(text)) {
    emoji = '🌐';
    category = '기타';
  } else if (/결제|구독|card|카드|pay|금액/i.test(text)) {
    emoji = '💳';
    category = '기타';
  } else if (/계정|pwd|password|비밀번호|인증|보안/i.test(text)) {
    emoji = '🔐';
    category = '기타';
  }

  return { emoji, category };
};

export default function MemoModal({ isOpen, onClose, memo, onSave, onDelete }: MemoModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [type, setType] = useState<'account' | 'site'>('account');
  const [error, setError] = useState('');

  // Dirty flags for recommendation override prevention
  const [isEmojiDirty, setIsEmojiDirty] = useState(false);
  const [isCategoryDirty, setIsCategoryDirty] = useState(false);

  // Common fields
  const [color, setColor] = useState('brand-main');
  const [emoji, setEmoji] = useState('🔐');
  const [category, setCategory] = useState('');

  // Account specific fields
  const [serviceName, setServiceName] = useState('');
  const [planName, setPlanName] = useState('');
  const [paymentContent, setPaymentContent] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly'); // monthly, yearly, etc.
  const [paymentAmount, setPaymentAmount] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [extensionNumber, setExtensionNumber] = useState('');
  const [usageStartDate, setUsageStartDate] = useState('');
  const [usageEndDate, setUsageEndDate] = useState('');

  // Site specific fields
  const [siteName, setSiteName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [description, setDescription] = useState('');
  const [siteType, setSiteType] = useState<'paid' | 'useful'>('useful');
  const [siteBillingCycle, setSiteBillingCycle] = useState('monthly');
  const [sitePaymentAmount, setSitePaymentAmount] = useState('');

  // View state password toggle
  const [showRawPassword, setShowRawPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<'id' | 'pwd' | 'url' | null>(null);

  // Autocomplete suggestion dropdown state
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);

  // Sync state when memo changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setShowRawPassword(false);
      setCopiedField(null);
      setError('');
      setShowUserSuggestions(false);

      if (memo) {
        setIsEditing(false);
        setType(memo.type);
        setColor(memo.color || 'brand-main');
        setEmoji(memo.emoji || '🔐');
        setCategory(memo.category || '');
        setIsEmojiDirty(true);
        setIsCategoryDirty(true);

        if (memo.type === 'account') {
          setServiceName(memo.serviceName || memo.title || '');
          setPlanName(memo.planName || '');
          setPaymentContent(memo.paymentContent || memo.content || '');
          setBillingCycle(memo.billingCycle || 'monthly');
          setPaymentAmount(memo.paymentAmount || '');
          setLoginId(memo.loginId || '');
          setPassword(memo.password || '');
          setCurrentUser(memo.currentUser || '');
          setExtensionNumber(memo.extensionNumber || '');
          setUsageStartDate(memo.usageStartDate || '');
          setUsageEndDate(memo.usageEndDate || '');
        } else {
          setSiteName(memo.title || '');
          setSiteUrl(memo.siteUrl || '');
          setDescription(memo.content || '');
          setSiteType((memo.planName as 'paid' | 'useful') || 'useful');
          setSiteBillingCycle(memo.billingCycle || 'monthly');
          setSitePaymentAmount(memo.paymentAmount || '');
        }
      } else {
        setIsEditing(true); // Create mode
        setType('account');
        setColor('brand-main');
        setEmoji('🔐');
        setCategory('');
        setIsEmojiDirty(false);
        setIsCategoryDirty(false);
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
        setCurrentUser('');
        setExtensionNumber('');
        setUsageStartDate('');
        setUsageEndDate('');
        setSiteType('useful');
        setSiteBillingCycle('monthly');
        setSitePaymentAmount('');
      }
    }
  }, [isOpen, memo]);

  if (!isOpen) return null;

  // Masking password logic: 앞 2글자 + 마스킹 + 뒤 2글자 (6자 미만이면 전체 마스킹)
  const maskPassword = (pwd: string) => {
    if (!pwd) return '';
    if (pwd.length < 6) {
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

  // Live Auto Recommendation Triggers
  const handleNameChange = (val: string) => {
    if (type === 'account') {
      setServiceName(val);
      if (!isEmojiDirty || !isCategoryDirty) {
        const rec = recommendEmojiAndCategory(val, paymentContent);
        if (rec.emoji && !isEmojiDirty) setEmoji(rec.emoji);
        if (rec.category && !isCategoryDirty) setCategory(rec.category);
      }
    } else {
      setSiteName(val);
      if (!isEmojiDirty || !isCategoryDirty) {
        const rec = recommendEmojiAndCategory(val, description);
        if (rec.emoji && !isEmojiDirty) setEmoji(rec.emoji);
        if (rec.category && !isCategoryDirty) setCategory(rec.category);
      }
    }
  };

  const handleDescChange = (val: string) => {
    if (type === 'account') {
      setPaymentContent(val);
      if (!isEmojiDirty || !isCategoryDirty) {
        const rec = recommendEmojiAndCategory(serviceName, val);
        if (rec.emoji && !isEmojiDirty) setEmoji(rec.emoji);
        if (rec.category && !isCategoryDirty) setCategory(rec.category);
      }
    } else {
      setDescription(val);
      if (!isEmojiDirty || !isCategoryDirty) {
        const rec = recommendEmojiAndCategory(siteName, val);
        if (rec.emoji && !isEmojiDirty) setEmoji(rec.emoji);
        if (rec.category && !isCategoryDirty) setCategory(rec.category);
      }
    }
  };

  // Employee extension auto fill & autocomplete suggestions
  const handleCurrentUserChange = (val: string) => {
    setCurrentUser(val);
    setShowUserSuggestions(val.length > 0);
    const match = EMPLOYEES.find(emp => emp.name.trim() === val.trim());
    if (match) {
      setExtensionNumber(match.extension);
    }
  };

  const handleSelectSuggestion = (emp: { name: string; extension: string }) => {
    setCurrentUser(emp.name);
    setExtensionNumber(emp.extension);
    setShowUserSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (type === 'account') {
        if (!serviceName.trim()) {
          setError('유료결제사이트명을 입력해주세요.');
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

        await onSave({
          id: memo?.id,
          type: 'account',
          title: serviceName.trim(),
          content: paymentContent.trim(),
          color,
          emoji,
          serviceName: serviceName.trim(),
          planName: planName.trim(),
          paymentContent: paymentContent.trim(),
          billingCycle,
          paymentAmount: paymentAmount.trim(),
          loginId: loginId.trim(),
          password: password.trim(),
          currentUser: currentUser.trim(),
          extensionNumber: extensionNumber.trim(),
          usageStartDate: usageStartDate,
          usageEndDate: usageEndDate,
          category: category.trim() || '기타',
          siteUrl: '',
        });
      } else {
        if (!siteName.trim()) {
          setError('유용한 사이트명을 입력해주세요.');
          return;
        }
        if (!siteUrl.trim()) {
          setError('URL 주소를 입력해주세요.');
          return;
        }

        // Prepend https:// if protocol is missing
        let formattedUrl = siteUrl.trim();
        if (!/^https?:\/\//i.test(formattedUrl)) {
          formattedUrl = `https://${formattedUrl}`;
        }

        await onSave({
          id: memo?.id,
          type: 'site',
          title: siteName.trim(),
          content: description.trim(),
          color,
          emoji,
          siteUrl: formattedUrl,
          category: category.trim() || '기타',
          planName: siteType, // stores site classification ('paid' | 'useful')
          billingCycle: siteType === 'paid' ? siteBillingCycle : '',
          paymentAmount: siteType === 'paid' ? sitePaymentAmount.trim() : '',
          serviceName: '',
          paymentContent: '',
          loginId: '',
          password: '',
          currentUser: '',
          extensionNumber: '',
          usageStartDate: '',
          usageEndDate: '',
        });
      }

      onClose();
    } catch (err: any) {
      console.error('Supabase Save Error caught in Modal:', err);
      setError(err?.message || '저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = () => {
    if (memo && confirm('정말로 이 공유 내역을 삭제하시겠습니까?')) {
      onDelete(memo.id);
      onClose();
    }
  };

  const getDDay = (endDate?: string) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'D-Day';
    if (diffDays < 0) return `만료 (${Math.abs(diffDays)}일 경과)`;
    return `D-${diffDays}`;
  };

  const selectedColorMeta = COLORS.find(c => c.name === color) || COLORS[0];
  const matchedSuggestions = EMPLOYEES.filter(emp => 
    emp.name.toLowerCase().includes(currentUser.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-2xl transition-all animate-modal-in border border-slate-100 flex flex-col max-h-[85vh]">
        
        {/* Color stripe on top */}
        <div className={`absolute top-0 left-0 right-0 h-2 ${selectedColorMeta.bg}`} />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 mt-2">
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">등록 유형</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => { setType('account'); setEmoji('🔐'); setIsEmojiDirty(false); setIsCategoryDirty(false); }}
                      className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 border text-sm font-semibold transition ${
                        type === 'account'
                          ? 'border-[#333399] bg-[#333399]/5 text-[#333399] ring-2 ring-[#333399]/20'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      💳 유료결제사이트
                    </button>
                    <button
                      type="button"
                      onClick={() => { setType('site'); setEmoji('🌐'); setIsEmojiDirty(false); setIsCategoryDirty(false); }}
                      className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 border text-sm font-semibold transition ${
                        type === 'site'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-600/10'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      🌐 유용한 사이트
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
                      onClick={() => { setEmoji(emo); setIsEmojiDirty(true); }}
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

              {/* Category Field */}
              <div>
                <label htmlFor="category" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">카테고리</label>
                <input
                  type="text"
                  id="category"
                  value={category}
                  onChange={(e) => { setCategory(e.target.value); setIsCategoryDirty(true); }}
                  placeholder="예: 영상 생성, 문서/대화 AI, 개발 도구 (미지정 시 자동 입력)"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition"
                />
              </div>

              <hr className="border-slate-100 my-2" />

              {/* Type specific forms */}
              {type === 'account' ? (
                /* Account Fields */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="serviceName" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">유료결제사이트명 *</label>
                      <input
                        type="text"
                        id="serviceName"
                        value={serviceName}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="예: ChatGPT, Kling, Runway"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#333399] focus:outline-none focus:ring-2 focus:ring-[#333399]/10 transition"
                      />
                    </div>
                    <div>
                      <label htmlFor="planName" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">요금 플랜명</label>
                      <input
                        type="text"
                        id="planName"
                        value={planName}
                        onChange={(e) => setPlanName(e.target.value)}
                        placeholder="예: Plus, Pro, Enterprise"
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
                        <option value="monthly">월간 결제</option>
                        <option value="yearly">연간 결제</option>
                        <option value="one-time">1회성 결제</option>
                        <option value="free">무료 플랜</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="paymentAmount" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">결제 금액</label>
                      <input
                        type="text"
                        id="paymentAmount"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="예: 29,000원, $20"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="paymentContent" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">결제 내용 / 설명</label>
                    <input
                      type="text"
                      id="paymentContent"
                      value={paymentContent}
                      onChange={(e) => handleDescChange(e.target.value)}
                      placeholder="예: GPT Plus 1개월, Kling Pro 영상 생성용"
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
                        placeholder="공용 이메일 혹은 ID"
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
                        placeholder="접속 비밀번호 (상세 마스킹 처리됨)"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition"
                      />
                    </div>
                  </div>

                  {/* Current User & Extension Number autocomplete */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="relative">
                      <label htmlFor="currentUser" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">현재 사용자 (직원명)</label>
                      <input
                        type="text"
                        id="currentUser"
                        value={currentUser}
                        onChange={(e) => handleCurrentUserChange(e.target.value)}
                        onFocus={() => setShowUserSuggestions(currentUser.length > 0)}
                        onBlur={() => setTimeout(() => setShowUserSuggestions(false), 200)}
                        placeholder="예: 김민수"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition"
                      />
                      
                      {/* Suggestion Dropdown */}
                      {showUserSuggestions && matchedSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                          {matchedSuggestions.map(emp => (
                            <button
                              key={emp.name}
                              type="button"
                              onClick={() => handleSelectSuggestion(emp)}
                              className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 text-slate-700 font-medium flex justify-between"
                            >
                              <span>{emp.name}</span>
                              <span className="text-slate-400 font-normal">내선번호: {emp.extension}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label htmlFor="extensionNumber" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">내선번호</label>
                      <input
                        type="text"
                        id="extensionNumber"
                        value={extensionNumber}
                        onChange={(e) => setExtensionNumber(e.target.value)}
                        placeholder="이름 입력 시 자동 반영 (직접 입력 가능)"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition"
                      />
                    </div>
                  </div>

                  {/* Usage Period Date Picker */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="usageStartDate" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">사용 시작일</label>
                      <input
                        type="date"
                        id="usageStartDate"
                        value={usageStartDate}
                        onChange={(e) => setUsageStartDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition"
                      />
                    </div>
                    <div>
                      <label htmlFor="usageEndDate" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">사용 만료일</label>
                      <input
                        type="date"
                        id="usageEndDate"
                        value={usageEndDate}
                        onChange={(e) => setUsageEndDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Site Fields */
                <div className="space-y-4">
                  <div>
                    <label htmlFor="siteName" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">유용한 사이트명 *</label>
                    <input
                      type="text"
                      id="siteName"
                      value={siteName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="예: Kling, 법령정보센터"
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
                      placeholder="예: naver.com, https://klingai.com"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">설명 또는 메모</label>
                    <textarea
                      id="description"
                      rows={4}
                      value={description}
                      onChange={(e) => handleDescChange(e.target.value)}
                      placeholder="사이트 용도, 업무 활용 방법 등 기재"
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
                  className="rounded-xl bg-[#333399] hover:bg-[#252573] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition"
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
                  {type === 'account' ? '유료결제사이트' : '유용한 사이트'}
                </span>
                
                {category && (
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-800">
                    📂 {category}
                  </span>
                )}
                
                {memo && (
                  <span className="text-xs text-slate-400 ml-auto">
                    마지막 수정: {new Date(memo.updatedAt).toLocaleString('ko-KR')}
                  </span>
                )}
              </div>

              {/* Main Info Header */}
              <div className="flex items-start gap-4">
                <span className="text-4xl p-3 bg-slate-50 rounded-2xl flex items-center justify-center shadow-inner border border-slate-100">{emoji}</span>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                    {type === 'account' ? serviceName : siteName}
                  </h2>
                  {type === 'account' && planName && (
                    <p className="text-sm font-semibold text-[#333399] mt-1.5 bg-[#333399]/5 inline-block px-2.5 py-0.5 rounded-md">플랜: {planName}</p>
                  )}
                </div>
              </div>

              {type === 'account' ? (
                /* Account Detail Layout */
                <div className="space-y-4">
                  {/* Credentials Box */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">접속 정보</span>
                      <span className="text-[10px] text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded font-mono">SECURE MASKED</span>
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
                            title="비밀번호 보기"
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
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">결제 금액</span>
                      <span className="text-sm font-semibold text-slate-800">{paymentAmount || '정보 없음'}</span>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">결제 주기</span>
                      <span className="text-sm font-semibold text-slate-800">
                        {billingCycle === 'monthly' ? '📅 월간 결제' : billingCycle === 'yearly' ? '📅 연간 결제' : billingCycle === 'one-time' ? '📅 1회성 결제' : '📅 무료 플랜'}
                      </span>
                    </div>
                  </div>

                  {/* Current User & Extension */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">현재 사용자</span>
                      <span className="text-sm font-semibold text-slate-800">{currentUser || '미지정'}</span>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">내선번호</span>
                      <span className="text-sm font-semibold text-slate-800">{extensionNumber || '정보 없음'}</span>
                    </div>
                  </div>

                  {/* Usage Period & D-Day */}
                  <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">사용 기간</span>
                      {usageEndDate && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          getDDay(usageEndDate)?.includes('만료') 
                            ? 'bg-rose-50 text-rose-600 border border-rose-100'
                            : getDDay(usageEndDate)?.includes('D-') && parseInt(getDDay(usageEndDate)?.replace('D-', '') || '99') <= 7
                              ? 'bg-amber-50 text-amber-600 border border-amber-100 animate-pulse'
                              : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                        }`}>
                          {getDDay(usageEndDate)}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-slate-700 block">
                      {usageStartDate || usageEndDate 
                        ? `${usageStartDate || '시작일 미정'} ~ ${usageEndDate || '만료일 미정'}`
                        : '등록된 사용 기간 정보가 없습니다.'
                      }
                    </span>
                  </div>

                  {/* Payment Content */}
                  {paymentContent && (
                    <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">상세 내용 및 결제 정보</span>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{paymentContent}</p>
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
                        className="inline-flex items-center gap-1 rounded-xl bg-[#333399] text-white px-4 py-2 text-xs font-semibold hover:bg-[#252573] shadow-md transition"
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
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#333399] hover:bg-[#252573] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition"
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
