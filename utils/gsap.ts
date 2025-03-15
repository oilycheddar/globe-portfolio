import { gsap } from 'gsap';

// Import all plugins
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { Draggable } from 'gsap/Draggable';
import { EasePack } from 'gsap/EasePack';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { PixiPlugin } from 'gsap/PixiPlugin';
import { TextPlugin } from 'gsap/TextPlugin';
import { Flip } from 'gsap/Flip';
import { Observer } from 'gsap/Observer';
import { CustomEase } from 'gsap/CustomEase';
import { CustomBounce } from 'gsap/CustomBounce';
import { CustomWiggle } from 'gsap/CustomWiggle';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { GSDevTools } from 'gsap/GSDevTools';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { SplitText } from 'gsap/SplitText';
import { Physics2DPlugin } from 'gsap/Physics2DPlugin';
import { PhysicsPropsPlugin } from 'gsap/PhysicsPropsPlugin';
import { MotionPathHelper } from 'gsap/MotionPathHelper';
import { ScrollSmoother } from 'gsap/ScrollSmoother';

// Register Club GreenSock first
if (typeof window !== 'undefined') {
  (window as any)._gsapKey = "b95b2fdc-09e5-40f2-9371-853421076148";
}

// Register all plugins
gsap.registerPlugin(
  ScrollTrigger,
  ScrollToPlugin,
  Draggable,
  EasePack,
  MotionPathPlugin,
  PixiPlugin,
  TextPlugin,
  Flip,
  Observer,
  CustomEase,
  CustomBounce,
  CustomWiggle,
  InertiaPlugin,
  MorphSVGPlugin,
  DrawSVGPlugin,
  GSDevTools,
  ScrambleTextPlugin,
  SplitText,
  Physics2DPlugin,
  PhysicsPropsPlugin,
  MotionPathHelper,
  ScrollSmoother
);

// Configure GSAP
gsap.config({
  nullTargetWarn: false,
});

// Register custom effect
gsap.registerEffect({
  name: "scrambleText",
  effect: (targets: any, config: any) => {
    return gsap.to(targets, {
      duration: config.duration || 1,
      scrambleText: {
        text: config.text,
        chars: config.chars || "0123456789",
        speed: config.speed || 1,
        newClass: config.newClass,
        oldClass: config.oldClass,
        revealDelay: config.revealDelay || 0,
      },
    });
  },
  defaults: { duration: 1 },
  extendTimeline: true,
});

// Make GSAP available globally
if (typeof window !== 'undefined') {
  (window as any).gsap = gsap;
}

export { 
  gsap,
  ScrollTrigger,
  ScrollToPlugin,
  Draggable,
  EasePack,
  MotionPathPlugin,
  PixiPlugin,
  TextPlugin,
  Flip,
  Observer,
  CustomEase,
  CustomBounce,
  CustomWiggle,
  InertiaPlugin,
  MorphSVGPlugin,
  DrawSVGPlugin,
  GSDevTools,
  ScrambleTextPlugin,
  SplitText,
  Physics2DPlugin,
  PhysicsPropsPlugin,
  MotionPathHelper,
  ScrollSmoother
}; 