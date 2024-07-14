import { Worker } from 'worker_threads';
import { fileURLToPath } from 'url';
import { dirname, resolve as pathResolve } from 'path';
import { BoundingBox, Pixel } from './images.interfaces.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function processDiffPixels(diffPixels: Pixel[], proximity = 5): Promise<BoundingBox[]> {
    return new Promise((resolve, reject) => {
        const worker = new Worker(pathResolve(__dirname, '../workers/pixelDiffProcessing.js'));

        worker.on('message', (boundingBoxes: BoundingBox[]) => {
            resolve(boundingBoxes);
        });

        worker.on('error', (error) => {
            reject(error);
        });

        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });

        worker.postMessage({ diffPixels, proximity });
    });
}


