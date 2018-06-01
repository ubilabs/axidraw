import keyboardMappings from '../constants/keyboard-mapping.js';

export default class Controller {
  constructor(map) {
    this.map = map;
    this.step = 100;

    const joystickIsConnected = false;

    if (joystickIsConnected) {
      this.initGamepadControls();
    } else {
      this.initKeyboardControls();
    }
  }

  initGamepadControls() {
    console.log('init gamepad controls');
  }

  initKeyboardControls() {
    const label = document.querySelector('#label');

    window.addEventListener('keyup', event => {
      if (keyboardMappings[event.code]) {
        if (document.activeElement !== label) {
          const action = keyboardMappings[event.code];
          this[action]();
        }
      }
    });
  }

  navigateLeft() {
    this.map.panBy([-this.step, 0]);
  }

  navigateRight() {
    this.map.panBy([this.step, 0]);
  }

  navigateUp() {
    this.map.panBy([0, -this.step]);
  }

  navigateDown() {
    this.map.panBy([0, this.step]);
  }

  zoomIn() {
    this.map.zoomIn();
  }

  zoomOut() {
    this.map.zoomOut();
  }

  preview() {
    const button = document.querySelector(
      '#action-buttons > button.preview-button'
    );

    button.click();
  }

  print() {
    const button = document.querySelector(
      '#action-buttons > button.print-button'
    );

    button.click();
  }
}
