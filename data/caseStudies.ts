export interface TeamMember {
  role: string;
  names: string[];
}

export interface CaseStudy {
  id: string;
  title: string;
  link: string;
  description: string;
  videoUrl: string;
  posterUrl: string;
  images?: string[]; // For bento box layout
  useBentoLayout?: boolean; // Enable bento box instead of single image/video
  team: TeamMember[];
  hideTeam?: boolean;
  hide?: boolean;
}

export const caseStudies: CaseStudy[] = [
  {
    id: 'ramp-treasury',
    title: 'Treasury @ Ramp',
    link: 'https://www.ramp.com/treasury',
    description: 'I LED THE ZERO-TO-ONE DESIGN FOR RAMP\'S BUSINESS & INVESTMENT ACCOUNTS.\nCREATED WITH THE FINANCIAL PRODUCTS TEAM AT RAMP.',
    videoUrl: 'none',
    posterUrl: '/Investment_Landing_Asset_Dark.png',
    useBentoLayout: true,
    images: [
      '/treasury_demo.mp4',                // Left: Tall demo video
      '/treasury_strategy_selection.png',  // Top right: Strategy selection
      '/treasury_mobile.png'               // Bottom right: Mobile view
    ],
    team: [
      { role: 'FRONT END', names: ['FARDEEM', 'MARK'] },
      { role: 'BACK END', names: ['ARNAB', 'ERIC', 'DANIELLE'] },
      { role: 'PRODUCT', names: ['WILLIAM', 'KARL'] },
      { role: 'DATA', names: ['JAMES'] },
      { role: 'MARKETING', names: ['BECKY', 'CHRISTY'] },
      { role: 'BRAND', names: ['EMILY', 'SHIVANI'] }
    ]
  },
  {
    id: 'affirmations',
    title: 'Affirmations @ Loom',
    link: 'https://www.loom.com',
    description: 'Designed loom\'s affirmations feature, which writes you a short, positive message after every recording.',
    videoUrl: 'loom_affirmations.mp4',
    posterUrl: '/loom_poster_image.png',
    team: [
      { role: 'FRONT END', names: ['FARDEEM', 'MARK'] },
      { role: 'BACK END', names: ['ARNAB', 'ERIC'] },
      { role: 'PRODUCT', names: ['WILLIAM', 'KARL'] },
      { role: 'DATA', names: ['JAMES'] },
      { role: 'MARKETING', names: ['BECKY', 'CHRISTY'] },
      { role: 'BRAND', names: ['EMILY', 'SHIVANI'] }
    ],
    hideTeam: true
  },
  {
    id: 'secured-credit',
    title: 'Secured Credit @ Neo financial',
    link: 'https://www.neofinancial.com/features/secured',
    description: 'DESIGNED NEO\'S SECURED CREDIT PRODUCT, HELPING CANADIANS BUILD THEIR CREDIT HISTORY WHILE EARNING CASHBACK. ZERO TO ONE RESEARCH AND DESIGN.',
    videoUrl: 'none',
    posterUrl: '/Secured Credit Neo.png',
    team: [
      { role: 'FRONT END', names: ['FARDEEM', 'MARK'] },
      { role: 'BACK END', names: ['ARNAB', 'ERIC'] },
      { role: 'PRODUCT', names: ['WILLIAM', 'KARL'] },
      { role: 'DATA', names: ['JAMES'] },
      { role: 'MARKETING', names: ['BECKY', 'CHRISTY'] },
      { role: 'BRAND', names: ['EMILY', 'SHIVANI'] }
    ],
    hideTeam: true
  },
  {
    id: 'rafflebox-branding',
    title: 'Branding & Web Design @ Rafflebox',
    link: 'none',
    description: 'I took on Rafflebox as a freelance client and helped update their brand identity, typography, and website.',
    videoUrl: 'none',
    posterUrl: '/Rafflebox Branding.png',
    team: [
      { role: 'FRONT END', names: ['FARDEEM', 'MARK'] },
      { role: 'BACK END', names: ['ARNAB', 'ERIC'] },
      { role: 'PRODUCT', names: ['WILLIAM', 'KARL'] },
      { role: 'DATA', names: ['JAMES'] },
      { role: 'MARKETING', names: ['BECKY', 'CHRISTY'] },
      { role: 'BRAND', names: ['EMILY', 'SHIVANI'] }
    ],
    hideTeam: true
  }
]; 