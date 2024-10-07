// @todo: This is ugly, this needs to come from the webdriver-image-comparison package or
// visual testing type package

import type { PlaceholderProps } from 'react-select'

export interface OptionType {
  label: string;
  value: string;
}

export interface BoundingBox {
  bottom: number;
  right: number;
  left: number;
  top: number;
}

export interface IgnoreBoxes extends BoundingBox {}

export interface InstanceData {
  app?: string;
  browser?: { name: string; version: string };
  deviceName?: string;
  platform: { name: string; version: string };
}

export interface BoundingBoxes {
  diffBoundingBoxes: BoundingBox[];
  ignoredBoxes: IgnoreBoxes[];
}

export interface ImageSize {
  width: number;
  height: number;
}

export interface Sizes {
  actual: ImageSize;
  baseline: ImageSize;
  diff?: ImageSize;
}

export interface FileData {
  actualFilePath: string;
  baselineFilePath: string;
  diffFilePath: string;
  fileName: string;
  size: Sizes;
}

export interface MethodData {
  description: string;
  test: string;
  tag: string;
  instanceData: InstanceData;
  commandName: string;
  framework: string;
  boundingBoxes: BoundingBoxes;
  fileData: FileData;
  misMatchPercentage: string;
  rawMisMatchPercentage: number;
}

export interface TestData {
  test: string;
  data: MethodData[];
}

export interface DescriptionData {
  description: string;
  data: TestData[];
}

export interface SnapshotInstanceData {
  app?: string[];
  browser?: { name: string; version: string }[];
  deviceName?: string[];
  platform: { name: string; version: string }[];
}

export interface SnapshotData {
  descriptionData: DescriptionData[];
  instanceData: SnapshotInstanceData;
}

export interface SnapshotDataLoader extends SnapshotData {
    error?: string | null;
}

export type StatusFilter = 'all' | 'passed' | 'failed';

export type SelectCustomPlaceholderProps = PlaceholderProps<
  OptionType,
  true
> & {
  iconName: string;
};

export type SelectCustomPlaceholderIconType =
  | 'status'
  | 'app'
  | 'browser'
  | 'device'
  | 'platform';

export interface SelectedOptions {
  app: string[];
  browser: string[];
  device: string[];
  platform: string[];
  status: StatusFilter;
}

export interface CanvasTransform {
  x: number;
  y: number;
  scale: number;
}

export interface CanvasDrawingProps {
    imageRef: React.RefObject<HTMLImageElement>
    canvasRef: React.RefObject<HTMLCanvasElement>
    transform: CanvasTransform
    diffBoxes: BoundingBox[]
    highlightedBox: BoundingBox | null
    ignoredBoxes: BoundingBox[]
}
