import { ComparisonOptions, ComparisonResult } from "./compare.interfaces.ts";

/**
 * The API under Node is the same as on the `resemble.compare` but promise based
 */
declare function compareImages(
    image1: string | ImageData | Buffer,
    image2: string | ImageData | Buffer,
    options: ComparisonOptions,
): Promise<ComparisonResult>;

export default compareImages;
