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

    const paths = renderSVGPaths(coords);
    this.svgContainer.innerHTML = paths.join('\n');
  }

  async print() {
    if (!this.axidraw){
      this.axidraw = await createAxidraw();
    }

    for (let i = 0; i < this._coords.length; i++) {
      const line = this._coords[i];
      const relativeLine = line.map(p => [
        p[0] / BOT_SCALE.factor + BOT_SCALE.offset,
        p[1] / BOT_SCALE.factor * BOT_SCALE.ratio
      ]);

      await this.axidraw.drawPath(relativeLine);
      this.progressBar.progress = i / (this._coords.length - 1);
    }

    await this.axidraw.parkPen();
  }
}