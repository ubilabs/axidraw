import rough from 'roughjs';

const jsConfLogoPath = [
  'M376,0H24A24.33,24.33,0,0,0,0,24V376a24.33,24.33,0,0,0,24,24H376a24.33,24.33,0,0,0,24-24V24A24.33,24.33,0,0,0,376,0ZM322,282l-69,69-69-69c-23-21-23-52-3-72s51-19,71,0c20-20,51-20,71,0S343,260,322,282Z'
];

const ubiLogoPaths = [
  'M200,0C89.55,0,0,89.53,0,200S89.53,400,200,400s200-89.53,200-200h0C400,89.54,310.46,0,200,0h0ZM134.28,256.8A56.84,56.84,0,1,1,191.11,200h0a56.83,56.83,0,0,1-56.83,56.83Zm100.53-.15H213V143h21.8Zm43.57,0H256.59V143h21.79Zm43.57,0H300.16V143H322Z',
  'M134.28,164.71A35.26,35.26,0,1,0,169.54,200h0A35.28,35.28,0,0,0,134.28,164.71Z'
];

const options = {fill: '#E10079', roughness: 2, hachureGap: 10};

const logoSvg = document.querySelector('#logo');
let logoPaths = jsConfLogoPath;
const previewSvg = document.querySelector('#preview');

const roughnessSlider = document.querySelector('#roughness');
const hachureGapSlider = document.querySelector('#hachure-gap');

const sliders = [roughnessSlider, hachureGapSlider];

sliders.forEach(slider => {
  slider.addEventListener('input', ({currentTarget}) =>
    updateLogo(currentTarget)
  );
});

function updateLogo(slider) {
  if (slider) {
    options[slider.dataset.type] = slider.value;
  }

  logoSvg.innerHTML = '';

  const rc = rough.svg(logoSvg);

  logoPaths.forEach(path => {
    const roughPath = rc.path(path, options);
    roughPath.setAttribute('transform', 'translate(25 25)');
    logoSvg.appendChild(roughPath);
  });
}

updateLogo();
