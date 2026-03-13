#!/usr/bin/env node

import chalk from 'chalk';
import { stdin, stdout } from 'process';
import readline from 'readline';

// ── Strava data ───────────────────────────────────────────────────────

let stravaDistance = 'Loading...';

let inputStarted = false;

async function fetchStrava() {
  try {
    const res = await fetch('https://georgevisan.com/api/strava/stats');
    const data = await res.json();
    if (data.distance) {
      stravaDistance = `${data.distance} YTD`;
    }
  } catch {
    stravaDistance = 'Unavailable';
  }
  // Re-render if the app is already showing
  if (inputStarted) render();
}

fetchStrava();

// ── Data ──────────────────────────────────────────────────────────────

const LINKS = {
  portfolio: 'https://georgevisan.com',
  github: 'https://github.com/oilycheddar/globe-portfolio',
  strava: 'https://www.strava.com/athletes/42678770',
  ramp: 'https://www.ramp.com/treasury',
  loom: 'https://www.loom.com',
  neo: 'https://www.neofinancial.com/features/secured',
};

const PROJECTS = [
  {
    title: 'Treasury @ Ramp',
    desc: 'Led the zero-to-one design for Ramp\'s business & investment accounts.',
    team: 'Front End · Back End · Product · Data · Marketing · Brand',
    link: LINKS.ramp,
  },
  {
    title: 'Affirmations @ Loom',
    desc: 'Designed Loom\'s affirmations feature — a short, positive message after every recording.',
    link: LINKS.loom,
  },
  {
    title: 'Secured Credit @ Neo Financial',
    desc: 'Designed Neo\'s secured credit product, helping Canadians build credit history while earning cashback.',
    link: LINKS.neo,
  },
  {
    title: 'Branding & Web Design @ Rafflebox',
    desc: 'Freelance client: updated brand identity, typography, and website.',
  },
  {
    title: 'Fig Psychology',
    desc: 'Logo design for my wife\'s psychology practice.',
  },
];

// ── Theme colors (from the portfolio's "slime" theme) ─────────────────

const lime = chalk.hex('#C1DF1E');
const dim = chalk.dim;
const bold = chalk.bold;
const white = chalk.white;
const grey = chalk.gray;

// ── Layout helpers ────────────────────────────────────────────────────

const TERM_WIDTH = Math.min(stdout.columns || 80, 80);

function divider() {
  return dim('─'.repeat(TERM_WIDTH));
}

function pad(text, width = TERM_WIDTH) {
  const lines = text.split('\n');
  return lines.map(l => '  ' + l).join('\n');
}

function wrap(text, maxWidth = TERM_WIDTH - 6) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxWidth) {
      lines.push(current.trim());
      current = word;
    } else {
      current = current ? current + ' ' + word : word;
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines.join('\n');
}

// ── Screens ───────────────────────────────────────────────────────────

const SCREENS = ['home', 'work', 'about'];
let currentScreen = 0;
let selectedProject = 0;
let selectedLink = 0;
const ABOUT_LINKS = [LINKS.portfolio, LINKS.github, LINKS.strava];

// Use alternate screen buffer to avoid polluting scrollback
function enterAltScreen() {
  stdout.write('\x1B[?1049h');
}
function exitAltScreen() {
  stdout.write('\x1B[?1049l');
}
function clear() {
  stdout.write('\x1B[2J\x1B[H');
}

function renderNav() {
  const tabs = SCREENS.map((name, i) => {
    const label = name.toUpperCase();
    return i === currentScreen ? lime.bold.underline(label) : grey(label);
  });
  return `  ${tabs.join(grey('  ·  '))}`;
}

function renderHome() {
  const globe = [
    '                        __,╓╔╔╦KDDR╠╠╠╩╙╙╙╙╩╠DDDK╦╔╔╓²__',
    '                 _,╔≡R╙^`╓╦R╙`   ╓D^         `╙╦  `\'╙╩╗╥"╙ªH╔,_',
    '             ,╔D╠╠╦╔╔╦╦K╩╩ªªª╙╙╙╠╙╙╙^^^^^^^^╙╙╙╙╚╠╙ªªªR╩╩D╦╔╔╦╠╠D╔,',
    '          ╓K╙`     ,D^        _╠                 ╙¼        ╙H_    `╙D╓_',
    '       ,é╙        @^          ╠                   ╙H         ╙K       ╙K,',
    '      φ╙                                                                ²D_',
    '     ╠   ╔╔╔╔╔╔╔╔╔  ╔╔╔╔╔╔╔╔⌐ ╔╔╔╔╔╔╔╔╔_ ╔╔╔╔╔╔╔╔╔  ╔╔╔╔╔╔╔╔╔  ╔╔╔╔╔╔╔╔   ╠_',
    '    ╚"   ╠╠Ü`______ ╠╠D,,,,,  ╠╠D````╠╠H ╠╠Ü```[╠╠ \'╠╠"`_____ j╠╠Ü,,,,,    ╠',
    '    ╠    ╠╠H ╙╙╙╠╠H ╠╠╩╙╙╙╙╙  ╠╠H    ╠╠H ╠╠╠╠╠╠╠╠╠ \'╠╠ ²╙╙╙╠╠ j╠╠╙╙╙╙╙╙    ╠',
    '    ²▒   ╚╠╠╠╠╠╠╠╠⌐ ╠╠╠╠╠╠╠╠H ╚╠╠╠╠╠╠╠╠⌐ ╠╠H   j╠╠  ╠╠╠╠╠╠╠╠╩ j╠╠╠╠╠╠╠╠   ╔H',
    '     └D                                                                  j╙',
    '       ╙╔_       ²H          \'D                   _D          j^       ╔╩',
    '         ╙D╓_      ╚╔         ╙H                  ╠         ╔╙      ╓#╙',
    '            "╚DK╦≡╔╔╦╠K╓,,,____╙H_____    ______,╠___,,,╓╓@╠╦╔φ╦@DR^',
    '                \'╙%φ╓²_`╙╚╗╖_`²``╚D""""""""""`[╠╙```_╓╗╩^_,╓φR╙^',
    '                      ²"╙ª%╠╠╠DK╔╓╓╠K╓_____╓╔DÜ╔╔@D╠╠Kª╙^`',
  ];

  const lines = [];
  lines.push(lime(globe.join('\n')));
  lines.push('');
  lines.push(pad(lime('product designer') + grey(' · ') + lime('long distance athlete')));
  lines.push('');
  lines.push(pad(dim('I enjoy some of the old, and I enjoy some of the new.')));
  lines.push(pad(dim('I\'m in love. Running gets my heart rate up, music slows it down.')));
  lines.push(pad(dim('I seek my own way. Honouring my intuition took many years.')));
  lines.push(pad(dim('My next job will be opening a hi-fi bar.')));

  return lines.join('\n');
}

function renderWork() {
  const lines = [];
  lines.push('');
  lines.push(pad(lime('  WORK\n  ────')));
  lines.push('');

  PROJECTS.forEach((proj, i) => {
    const isSelected = i === selectedProject;
    const marker = isSelected ? lime('▸ ') : '  ';
    const title = isSelected ? lime.bold(proj.title) : white(proj.title);
    lines.push(pad(marker + title));
    if (isSelected) {
      lines.push(pad('    ' + grey(wrap(proj.desc, TERM_WIDTH - 12).split('\n').join('\n    '))));
      if (proj.team) {
        lines.push(pad('    ' + dim('Team: ' + proj.team)));
      }
      if (proj.link) {
        lines.push(pad('    ' + dim.underline(proj.link)));
      }
    }
    lines.push('');
  });

  return lines.join('\n');
}

function renderAbout() {
  const lines = [];
  lines.push('');
  lines.push(pad(lime('  ABOUT\n  ─────')));
  lines.push('');

  const bio = [
    ['Role', 'Staff Product Designer at Ramp'],
    ['Focus', 'Zero to one'],
    ['Running', stravaDistance],
    ['Site', 'Claude Code, Cursor, Three.js'],
  ];

  const maxLabel = Math.max(...bio.map(([l]) => l.length));
  for (const [label, value] of bio) {
    lines.push(pad(lime(label.padEnd(maxLabel + 2)) + white(value)));
  }

  lines.push('');
  lines.push(divider());
  lines.push('');
  lines.push(pad(bold('Links')));
  lines.push('');
  const linkLabels = ['Portfolio', 'GitHub', 'Strava'];
  ABOUT_LINKS.forEach((url, i) => {
    const isSelected = i === selectedLink;
    const marker = isSelected ? lime('▸ ') : '  ';
    const label = isSelected ? lime.bold(linkLabels[i].padEnd(11)) : lime(linkLabels[i].padEnd(11));
    lines.push(pad(marker + label + (isSelected ? white.underline(url) : dim.underline(url))));
  });
  lines.push('');

  return lines.join('\n');
}

function renderFooter() {
  const lines = [];
  lines.push(divider());
  lines.push(pad(dim('←/→ switch tabs') + '   ' + dim('↑/↓ browse projects') + '   ' + dim('o open link') + '   ' + dim('q quit')));
  return lines.join('\n');
}

function render() {
  clear();
  let content;
  switch (SCREENS[currentScreen]) {
    case 'home': content = renderHome(); break;
    case 'work': content = renderWork(); break;
    case 'about': content = renderAbout(); break;
  }
  console.log(renderNav());
  console.log(content);
  console.log(renderFooter());
}

// ── Input handling ────────────────────────────────────────────────────

function openLink(url) {
  if (!url) return;
  import('child_process').then(({ execFileSync }) => {
    const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
    try {
      execFileSync(cmd, [url], { stdio: 'ignore' });
    } catch {}
  });
}

function startInput() {
  readline.emitKeypressEvents(stdin);
  if (stdin.isTTY) stdin.setRawMode(true);

  stdin.on('keypress', (str, key) => {
  if (!key) return;

  if (key.name === 'q' || (key.ctrl && key.name === 'c')) {
    exitAltScreen();
    console.log(lime('\n  Thanks for stopping by, godspeed my creative friend.\n'));
    process.exit(0);
  }

  if (key.name === 'right' || key.name === 'l') {
    currentScreen = Math.min(currentScreen + 1, SCREENS.length - 1);
  }
  if (key.name === 'left' || key.name === 'h') {
    currentScreen = Math.max(currentScreen - 1, 0);
  }
  // Number shortcuts for tabs
  if (str === '1') currentScreen = 0;
  if (str === '2') currentScreen = 1;
  if (str === '3') currentScreen = 2;

  if (key.name === 'up' || key.name === 'k') {
    if (SCREENS[currentScreen] === 'work') {
      selectedProject = Math.max(selectedProject - 1, 0);
    }
    if (SCREENS[currentScreen] === 'about') {
      selectedLink = Math.max(selectedLink - 1, 0);
    }
  }
  if (key.name === 'down' || key.name === 'j') {
    if (SCREENS[currentScreen] === 'work') {
      selectedProject = Math.min(selectedProject + 1, PROJECTS.length - 1);
    }
    if (SCREENS[currentScreen] === 'about') {
      selectedLink = Math.min(selectedLink + 1, ABOUT_LINKS.length - 1);
    }
  }
  if (key.name === 'o' || key.name === 'return') {
    if (SCREENS[currentScreen] === 'work' && PROJECTS[selectedProject].link) {
      openLink(PROJECTS[selectedProject].link);
    }
    if (SCREENS[currentScreen] === 'home') {
      openLink(LINKS.portfolio);
    }
    if (SCREENS[currentScreen] === 'about') {
      openLink(ABOUT_LINKS[selectedLink]);
    }
  }

  render();
  });
}

// ── Start ─────────────────────────────────────────────────────────────

enterAltScreen();
startInput();
inputStarted = true;
render();
