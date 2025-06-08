export interface Folders {
    /** The actual folder where the current screenshots need to be saved */
    actualFolder: string;
    /** The baseline folder where the baseline screenshots can be found */
    baselineFolder: string;
    /** The diff folder where the differences are saved */
    diffFolder: string;
}
