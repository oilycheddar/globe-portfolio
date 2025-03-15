import { typography } from '../styles/text';
import { ReactNode } from 'react';
import styled from 'styled-components';

// Types
type BaseToggleProps = {
  label: string;
  onClick: () => void;
  className?: string;
};

type BooleanToggleProps = BaseToggleProps & {
  type: 'boolean';
  value: boolean;
};

type MultiValueToggleProps<T extends string> = BaseToggleProps & {
  type: 'multi';
  value: T;
  values: readonly T[];
};

export type ValueToggleProps<T extends string = string> = BooleanToggleProps | MultiValueToggleProps<T>;

// Styled Components
const Container = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-sm);
`;

const Label = styled.span`
  color: var(--color-text);
  ${Object.entries(typography.caption).map(([key, value]) => `${key}: ${value};`).join('\n')}
`;

const Button = styled.button<{ $isActive: boolean }>`
  padding: 4px 8px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  background-color: ${props => props.$isActive ? 'var(--color-accent-primary)' : 'var(--color-accent-secondary)'};
  transition: background-color 0.2s ease;

  span {
    color: var(--color-text-secondary);
    ${Object.entries(typography.caption).map(([key, value]) => `${key}: ${value};`).join('\n')}
  }
`;

export function ValueToggle<T extends string = string>(props: ValueToggleProps<T>): ReactNode {
  const { label, value, onClick, className } = props;

  // For boolean toggles, use the value directly
  // For multi-value toggles, always show as active
  const isActive: boolean = props.type === 'boolean' ? value as boolean : true;

  return (
    <Container className={className}>
      <Label>{label}</Label>
      <Button onClick={onClick} $isActive={isActive}>
        <span>
          {typeof value === 'boolean' ? (value ? 'ON' : 'OFF') : value}
        </span>
      </Button>
    </Container>
  );
}
