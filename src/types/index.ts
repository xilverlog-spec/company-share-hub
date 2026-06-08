export interface Memo {
  id: string;
  type: 'account' | 'site';
  title: string;       // Used as Site Name for site type, and fallback title
  content: string;     // Used as description for site type, and fallback content
  createdAt: string;
  updatedAt: string;

  // New extended fields
  emoji?: string;
  color?: string;
  serviceName?: string;
  planName?: string;
  paymentContent?: string;
  billingCycle?: string;
  paymentAmount?: string;
  loginId?: string;
  password?: string;
  siteUrl?: string;
  
  // Custom new fields
  currentUser?: string;
  extensionNumber?: string;
  usageStartDate?: string;
  usageEndDate?: string;
  category?: string;
}

