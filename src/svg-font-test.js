import convertTextToCoords from './lib/convert-text-to-coords';
import {renderSVGPaths} from './lib/svg-tools';

(async function(){
  const text = 'This is a Test';
  const lines = await convertTextToCoords(text);
  document.body.innerHTML += `<svg>${renderSVGPaths(lines)}</svg>`;
})();
