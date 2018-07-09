import load from '../lib/load-svg-as-coords.js';
import {scaleAndMove} from '../lib/scale-move';

export default async function renderClaim() {
  const ubi = await load('/assets/ubilabs-logo.svg');
  const love = await load('/assets/made-with-love-mapbox-and-javascript.svg');

  return [
    ...scaleAndMove(love, {scale: 1.5, x: 90, y: 610}),
    ...scaleAndMove(ubi, {scale: 0.25, x: 200, y: 640})
  ];
}
