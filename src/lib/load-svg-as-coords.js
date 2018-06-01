import { convertSVGToCoords } from './svg-tools';

export default async function loadSVGCoords(url) {
  const response = await fetch(url);
  const logoSVGString = await response.text();
  const parser = new DOMParser();
  const logoSVGElement = parser.parseFromString(
    logoSVGString,
    'image/svg+xml'
  );

  return convertSVGToCoords(logoSVGElement);
}
