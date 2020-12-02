import createAxidraw from './axidraw';
import ProgressBar from './progress-bar';
import {renderSVGPaths} from './svg-tools';

export default class Plotter {
  constructor(device, paperSize, coords = []) {
    this.device = device
    this.paperSize = paperSize
    
    this.svgContainer = document.getElementById('preview');
    
    this.progressBar = new ProgressBar(document.body);
    
    this.computeScale()
    
    this.coords = coords;
    this.shouldAbortPrinting = false;
  }

  computeScale () {
    const { device, paperSize } = this
    this.xScale = device.width / paperSize.width
    this.yScale = device.height / paperSize.height
    this.deviceRatio = device.width / device.height
  }

  set coords(coords) {
    this._coords = coords;

    this.svgContainer.innerHTML = '';

    const scaledCoords = coords.map((line) => {
      return line.map((coords) => {
        return [
          coords[0] * this.paperSize.previewScale,
          coords[1] * this.paperSize.previewScale
      ]
      })
    })

    this.svgPaths = renderSVGPaths(scaledCoords, {renderAs: 'nodes'});
    this.svgPaths.forEach(path => {
      this.svgContainer.appendChild(path);
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

  abort() {
    const response = window.confirm('This will abort the printing!');
    this.shouldAbortPrinting = response;
  }

  async print() {
    if (!this.axidraw) {
      this.axidraw = await createAxidraw();
    }

    this.svgPaths.forEach(path => {
      path.setAttribute('class', 'pending');
    });

    for (let i = 0; i < this._coords.length; i++) {
      if (this.shouldAbortPrinting) {
        i = this._coords.length;
      }

      const line = this._coords[i];
      const path = this.svgPaths[i];

      path.setAttribute('class', 'current');

      const relativeLine = line.map(p => [
        p[0] / (this.paperSize.width) * (this.paperSize.width / this.device.width) * 100,
        p[1] / (this.paperSize.height) * (this.paperSize.height / this.device.height) * 100
      ]);

      console.log(relativeLine, this.xScale, this.yScale, this.deviceRatio)

      /await this.axidraw.drawPath(relativeLine);
      path.removeAttribute('class');
      this.progressBar.progress = i / (this._coords.length - 1);
    }

    await this.axidraw.parkPen();
  }
}
