import {plotLines} from './lib/plot-lines';

const width = 200;
const height = 100;
const zoom = 18;
const center = [9.995, 53.565];

plotLines({width, height, zoom, center}, document.querySelector('#map'));
