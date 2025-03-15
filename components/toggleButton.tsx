import { textStyles } from '../styles/text';
import styles from './ToggleButton.module.css';

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
    <div className={styles.container}>
      <span className={`${textStyles.caption} ${styles.label}`}>{props.label}</span>
      <div 
        onClick={handleClick}
        data-type={props.type}
        className={`${styles.button} ${
          props.type === 'boolean' && props.value ? styles.active : ''
        }`}
      >
        <span className={`${textStyles.caption} ${styles.value}`}>
          {props.type === 'boolean' ? (props.value ? 'ON' : 'OFF') : props.value}
        </span>
      </div>
    </div>
  );
}
