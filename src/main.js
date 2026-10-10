import './style.css';
import { initTrig } from './lessons/trig.js';
import { initCalculus } from './lessons/calculus.js';
import { initGeometry } from './lessons/geometry.js';

initTrig(document.querySelector('[data-lesson="trig"]'));
initCalculus(document.querySelector('[data-lesson="calculus"]'));
initGeometry(document.querySelector('[data-lesson="geometry"]'));
