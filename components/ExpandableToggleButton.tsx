import { useState, useRef, useEffect } from 'react';
import { textStyles } from '../styles/text';
import styles from './ExpandableToggleButton.module.css';
import gsap from 'gsap';

type BaseToggleProps = {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

export function ExpandableToggleButton(props: BaseToggleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !optionsRef.current) return;

    const tl = gsap.timeline({
      paused: true,
      defaults: {
        duration: 0.3,
        ease: "power3.out"
      }
    });

    // Set initial states
    gsap.set(optionsRef.current, {
      height: 0,
      opacity: 0,
      y: -10
    });

    // Create animation
    tl.to(optionsRef.current, {
      height: "auto",
      opacity: 1,
      y: 0
    });

    // Play or reverse based on expanded state
    if (isExpanded) {
      tl.play();
    } else {
      tl.reverse();
    }

    return () => {
      tl.kill();
    };
  }, [isExpanded]);

  const handleOptionClick = (option: string) => {
    props.onChange(option);
    setIsExpanded(false);
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <span className={`${textStyles.caption} ${styles.label}`}>{props.label}</span>
      <div className={styles.toggleWrapper}>
        <div 
          ref={buttonRef}
          onClick={() => setIsExpanded(!isExpanded)}
          className={`${styles.button} ${isExpanded ? styles.active : ''}`}
          data-expanded={isExpanded}
        >
          <span className={`${textStyles.caption} ${styles.value}`}>
            {props.value}
          </span>
        </div>
        <div 
          ref={optionsRef}
          className={styles.optionsContainer}
        >
          {props.options
            .filter(option => option !== props.value)
            .map((option) => (
            <div
              key={option}
              onClick={() => handleOptionClick(option)}
              className={`${styles.option} ${option === props.value ? styles.selected : ''}`}
            >
              <span className={`${textStyles.caption} ${styles.optionText}`}>
                {option}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 