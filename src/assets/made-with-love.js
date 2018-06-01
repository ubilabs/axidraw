import { convertSVGToCoords } from '../lib/svg-tools';

export const logoSVGString = `
`;

const parser = new DOMParser();
export const logoSVGElement = parser.parseFromString(
  logoSVGString,
  'image/svg+xml'
);

export const logoCoords = convertSVGToCoords(logoSVGElement);
