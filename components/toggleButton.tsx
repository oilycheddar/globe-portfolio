import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Label = styled.span`
  font-size: 12px;
  font-family: var(--font-mono);
  font-weight: 700;
  line-height: 15.8px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text);
`;

const Button = styled.div<{ $isActive?: boolean; $isMulti?: boolean }>`
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 20px;
  background-color: ${props => props.$isMulti || props.$isActive ? 'var(--color-accent-primary)' : 'var(--color-accent-secondary)'};
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  text-align: center;
`;

const Value = styled.span<{ $isActive?: boolean; $isMulti?: boolean }>`
  font-size: 12px;
  font-family: var(--font-mono);
  font-weight: 700;
  line-height: 15.8px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${props => props.$isMulti || props.$isActive ? 'var(--color-text-secondary)' : 'var(--color-text)'};
`;

type BaseToggleProps = {
  label: string;
};

type BooleanToggleProps = BaseToggleProps & {
  type: 'boolean';
  value: boolean;
  onChange: (value: boolean) => void;
};

type MultiToggleProps<T> = BaseToggleProps & {
  type: 'multi';
  value: T;
  options: T[];
  onChange: (value: T) => void;
};

type ToggleButtonProps<T> = BooleanToggleProps | MultiToggleProps<T>;

export function ToggleButton<T extends string>(props: ToggleButtonProps<T>) {
  const handleClick = () => {
    if (props.type === 'boolean') {
      props.onChange(!props.value);
    } else {
      const currentIndex = props.options.indexOf(props.value);
      const nextIndex = (currentIndex + 1) % props.options.length;
      props.onChange(props.options[nextIndex]);
    }
  };

  return (
    <Container>
      <Label>{props.label}</Label>
      <Button 
        onClick={handleClick}
        data-type={props.type}
        $isActive={props.type === 'boolean' && props.value}
        $isMulti={props.type === 'multi'}
      >
        <Value 
          $isActive={props.type === 'boolean' && props.value}
          $isMulti={props.type === 'multi'}
        >
          {props.type === 'boolean' ? (props.value ? 'ON' : 'OFF') : props.value}
        </Value>
      </Button>
    </Container>
  );
}
