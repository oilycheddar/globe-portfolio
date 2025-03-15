import { JetBrains_Mono } from 'next/font/google';

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
});

interface ToggleButtonProps {
  label: string;
  mode: 'cycle' | 'binary';
  // For cycle mode
  values?: string[];
  currentValue?: string;
  // For binary mode
  isOn?: boolean;
  onValue?: string;
  offValue?: string;
  // Common props
  onClick: () => void;
}

export default function ToggleButton({ 
  label, 
  mode, 
  values = [], 
  currentValue = '',
  isOn = false,
  onValue = 'ON',
  offValue = 'OFF',
  onClick 
}: ToggleButtonProps) {
  // Determine the display value and active state
  const isCycleMode = mode === 'cycle';
  const isActive = isCycleMode ? true : isOn;
  const displayValue = isCycleMode ? currentValue : (isOn ? onValue : offValue);

  return (
    <button 
      onClick={onClick}
      className={`inline-flex justify-center items-center gap-3 px-6 py-3 rounded-lg shadow-md relative z-30 ${jetbrainsMono.className} ${
        isActive 
          ? 'bg-[var(--color-accent-primary)] text-[var(--color-text)]' 
          : 'bg-[var(--color-page-content)] text-[var(--color-text)]'
      }`}
    >
      <span className="text-lg font-medium uppercase">{label}</span>
      <span 
        className={`min-w-[52px] px-2 py-1 rounded-[70px] text-sm font-medium uppercase ${
          isActive 
            ? 'bg-[var(--color-accent-secondary)] text-[var(--color-text)]' 
            : 'bg-[var(--color-accent-primary)] text-[var(--color-text-secondary)]'
        }`}
      >
        {displayValue}
      </span>
    </button>
  );
}
