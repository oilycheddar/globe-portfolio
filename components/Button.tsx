import { withHoverSound } from './withHoverSound';

const Button = ({ children, ...props }) => (
  <button {...props}>{children}</button>
);

export const ButtonWithSound = withHoverSound(Button); 