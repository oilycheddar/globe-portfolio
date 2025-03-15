import type { Preview } from '@storybook/react';
import React from 'react';
import '../styles/globals.css';
import { GlobalDecorator } from './GlobalDecorator';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'dark',
          value: '#0E0E0E',
        },
        {
          name: 'light',
          value: '#F7F8E8',
        },
      ],
    },
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'slime',
      toolbar: {
        icon: 'paintbrush',
        items: ['slime', 'water', 'acid', 'bunny', 'dune'],
      },
    },
  },
  decorators: [
    GlobalDecorator,
    (Story) => (
      <div className="min-h-screen p-4">
        <Story />
      </div>
    ),
  ],
};

export default preview; 