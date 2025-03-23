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
  team: TeamMember[];
  hideTeam?: boolean;
}

export const caseStudies: CaseStudy[] = [
  {
    id: 'ramp-treasury',
    title: 'Treasury @ Ramp',
    link: 'https://www.ramp.com/treasury',
    description: 'I LED THE ZERO-TO-ONE DESIGN FOR RAMP\'S BUSINESS & INVESTMENT ACCOUNTS.\nCREATED WITH THE FINANCIAL PRODUCTS TEAM AT RAMP.',
    videoUrl: '/TreasuryDemoReel.mp4',
    posterUrl: '/Investment_Landing_Asset_Dark.png',
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
    id: 'Runway',
    title: 'Runway @ Ramp',
    link: 'none',
    description: 'I led the research, product spec, and design for Ramp\'s breakthrough cash management feature. Finance teams can set their ideal bank balance, and Ramp will do the rest.',
    videoUrl: 'none',
    posterUrl: '/Runway_drawer_dark.png',
    team: [
        { role: 'FRONT END', names: ['FARDEEM', 'MARK'] },
        { role: 'BACK END', names: ['ARNAB'] },
        { role: 'PRODUCT', names: ['KARL'] },
        { role: 'DATA', names: ['JAMES'] },
    ],
    hideTeam: true
  },
  {
    id: 'affirmations',
    title: 'Affirmations @ Loom',
    link: 'https://www.loom.com',
    description: 'Designed loom\'s affirmations feature, which writes you a short, positive message after every recording.',
    videoUrl: 'loom_affirmations.mp4',
    posterUrl: 'none',
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