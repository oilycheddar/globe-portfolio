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
    title: 'RAMP TREASURY',
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
    title: 'Runway',
    link: 'none',
    description: 'A single place to manage your company\'s cash. Choose how many weeks of runway you need and Ramp will do the rest.',
    videoUrl: 'none',
    posterUrl: '/Runway_Drawer_Dark.png',
    team: [
        { role: 'FRONT END', names: ['FARDEEM', 'MARK'] },
        { role: 'BACK END', names: ['ARNAB'] },
        { role: 'PRODUCT', names: ['KARL'] },
        { role: 'DATA', names: ['JAMES'] },
    ],
    hideTeam: false
  }
]; 