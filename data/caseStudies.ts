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
}

export const caseStudies: CaseStudy[] = [
  {
    id: 'ramp-treasury',
    title: 'RAMP TREASURY',
    link: 'https://www.ramp.com/treasury',
    description: 'I LED THE ZERO-TO-ONE DESIGN FOR RAMP\'S BUSINESS & INVESTMENT ACCOUNTS.\nCREATED WITH THE FINANCIAL PRODUCTS TEAM AT RAMP.',
    videoUrl: '/TreasuryDemoReel.mp4',
    posterUrl: '/RBA_Intelligence_Asset_Dark.png',
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
    description: 'Finally, a single place to manage your cash.\nDefine how many weeks of runway you want and Ramp will do the rest.',
    videoUrl: 'none',
    posterUrl: '/runway_asset_dark.png',
    team: [
      { role: 'FRONT END', names: ['ALEX', 'SARAH'] },
      { role: 'BACK END', names: ['MICHAEL', 'LISA'] },
      { role: 'PRODUCT', names: ['DAVID', 'RACHEL'] },
      { role: 'DESIGN', names: ['JENNIFER', 'TOM'] },
      { role: 'MARKETING', names: ['CHRIS', 'AMANDA'] }
    ]
  }
]; 