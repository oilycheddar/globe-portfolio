import { gsap } from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrambleTextPlugin, SplitText);

// Configure GSAP
gsap.config({
  nullTargetWarn: false,
});

export { gsap, ScrambleTextPlugin, SplitText };