import createAxidraw from './axidraw';
import ProgressBar from './progress-bar';
import {renderSVGPaths} from './svg-tools';

const BOT_SCALE = {
  ratio: 12000 / 8720,
  factor: 14.2,
  offset: 20
};

export default class Plotter {
  constructor(coords = []) {
    this.svgContainer = document.getElementById('preview');
    this.progressBar = new ProgressBar(document.body);
    this.coords = coords;
  }

  set coords(coords) {
    this._coords = coords;

    this.svgPaths = renderSVGPaths(coords, {renderAs: 'nodes'});
    this.svgPaths.forEach(path => {
      this.svgContainer.appendChild(path)
    });
  }

  setAnimatedCoords(coords) {
    this._coords = coords;
    this.svgPaths = renderSVGPaths(coords, {renderAs: 'nodes'});
    this.svgPaths.forEach((path, index) => {
      const oldPath = this.svgContainer.querySelector(`path:nth-child(${index + 1})`);

      if (!oldPath) {
        this.svgContainer.appendChild(path);
        return;
      }

      oldPath.setAttribute('d', path.getAttribute('d'));
    });
  }

  async print() {
    if (!this.axidraw){
      this.axidraw = await createAxidraw();
    }

    this.svgPaths.forEach(path => {
      path.setAttribute('class', 'pending');
    });

    for (let i = 0; i < this._coords.length; i++) {
      const line = this._coords[i];
      const path = this.svgPaths[i];

      path.setAttribute('class', 'current');

      const relativeLine = line.map(p => [
        p[0] / BOT_SCALE.factor + BOT_SCALE.offset,
        p[1] / BOT_SCALE.factor * BOT_SCALE.ratio
      ]);

      await this.axidraw.drawPath(relativeLine);
      path.removeAttribute('class');
      this.progressBar.progress = i / (this._coords.length - 1);
    }

    await this.axidraw.parkPen();
  }
}
