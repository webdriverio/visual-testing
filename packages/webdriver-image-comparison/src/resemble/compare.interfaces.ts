export interface CompareData {
  // The mismatch percentage like 0.12345567
  rawMisMatchPercentage: number;
  // The mismatch percentage like 0.12
  misMatchPercentage: number;
  // The image
  getBuffer: () => Buffer;
  diffBounds: {
    top: number;
    left: number;
    bottom: number;
    right: number;
  };
  // The analysis time in milliseconds
  analysisTime: number;
}
