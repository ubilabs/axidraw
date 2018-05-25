export default class ProgressBar {
  constructor(root) {
    this.container = document.createElement('div');
    this.bar = document.createElement('div');

    this.container.classList.add('progress-bar');
    this.bar.classList.add('progress-bar__bar');

    this.container.appendChild(this.bar);
    root.appendChild(this.container);
  }

  set progress(progress) {
    this.bar.style.width = `${progress * 100}%`;
  }
}
