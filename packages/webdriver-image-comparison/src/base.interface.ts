export interface Folders {
  actualFolder: string; // The actual folder where the current screenshots need to be saved
  baselineFolder: string; // The baseline folder where the baseline screenshots can be found
  diffFolder: string; // The diff folder where the differences are saved
}
