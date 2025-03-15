import type { Meta, StoryObj } from '@storybook/react';
import { ValueToggle, type ValueToggleProps } from './valueToggle';
import { useState } from 'react';
import { themes } from '../styles/themes';

const meta = {
  title: 'Components/ValueToggle',
  component: ValueToggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ValueToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

// Boolean Toggle Story
const booleanArgs: ValueToggleProps = {
  type: 'boolean',
  label: 'Dark Mode',
  value: false,
  onClick: () => {},
};

export const BooleanToggle: Story = {
  args: booleanArgs,
  render: (args) => {
    const [isOn, setIsOn] = useState(args.value as boolean);
    
    return (
      <div style={{ padding: '20px' }}>
        <ValueToggle
          {...args}
          type="boolean"
          value={isOn}
          onClick={() => setIsOn(!isOn)}
        />
      </div>
    );
  }
};

// Theme Toggle Story
type ThemeType = keyof typeof themes;

const themeArgs: ValueToggleProps<ThemeType> = {
  type: 'multi',
  label: 'Theme',
  value: 'slime',
  values: Object.keys(themes) as readonly ThemeType[],
  onClick: () => {},
};

export const ThemeToggle: Story = {
  args: themeArgs,
  render: (args) => {
    const [currentTheme, setCurrentTheme] = useState<ThemeType>(args.value as ThemeType);
    const themeValues = (args as typeof themeArgs).values;
    
    const cycleTheme = () => {
      const currentIndex = themeValues.indexOf(currentTheme);
      const nextIndex = (currentIndex + 1) % themeValues.length;
      setCurrentTheme(themeValues[nextIndex]);
    };
    
    return (
      <div style={{ padding: '20px' }}>
        <ValueToggle<ThemeType>
          {...args}
          type="multi"
          value={currentTheme}
          values={themeValues}
          onClick={cycleTheme}
        />
      </div>
    );
  }
}; 