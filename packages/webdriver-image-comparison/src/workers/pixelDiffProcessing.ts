import { BoundingBox, Pixel } from 'src/methods/images.interfaces.js';
import { parentPort } from 'worker_threads';

class DisjointSet {
    private parent: Map<string, string>;
    private rank: Map<string, number>;

    constructor() {
        this.parent = new Map();
        this.rank = new Map();
    }

    find(x: string): string {
        if (this.parent.get(x) !== x) {
            this.parent.set(x, this.find(this.parent.get(x) as string)); // Path compression
        }
        return this.parent.get(x) as string;
    }

    union(x: string, y: string): void {
        const rootX = this.find(x);
        const rootY = this.find(y);

        if (rootX !== rootY) {
            const rankX = this.rank.get(rootX) || 0;
            const rankY = this.rank.get(rootY) || 0;

            if (rankX > rankY) {
                this.parent.set(rootY, rootX);
            } else if (rankX < rankY) {
                this.parent.set(rootX, rootY);
            } else {
                this.parent.set(rootY, rootX);
                this.rank.set(rootX, rankX + 1);
            }
        }
    }

    add(x: string): void {
        if (!this.parent.has(x)) {
            this.parent.set(x, x);
            this.rank.set(x, 0);
        }
    }
}

function processDiffPixels(diffPixels: Pixel[], proximity = 5): BoundingBox[] {
    console.log('Processing diff pixels started');
    const totalStartTime = Date.now();

    const ds = new DisjointSet();
    const pixelMap = new Map<string, Pixel>();
    const directions = [
        { dx: 1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 1, dy: 1 },
        { dx: -1, dy: 1 },
    ];

    // Initialize disjoint set and pixel map
    for (const pixel of diffPixels) {
        const key = `${pixel.x},${pixel.y}`;
        ds.add(key);
        pixelMap.set(key, pixel);
    }

    console.log('Union operations started');
    const unionStartTime = Date.now();

    // Union pixels within the proximity range
    for (const pixel of diffPixels) {
        const key = `${pixel.x},${pixel.y}`;
        for (const { dx, dy } of directions) {
            const neighborKey = `${pixel.x + dx},${pixel.y + dy}`;
            if (pixelMap.has(neighborKey)) {
                ds.union(key, neighborKey);
            }
        }
    }
    console.log(`Union time: ${Date.now() - unionStartTime}ms`);

    console.log('Grouping pixels into bounding boxes');
    const groupingStartTime = Date.now();

    // Group pixels by their root
    const groups = new Map<string, Pixel[]>();
    for (const key of pixelMap.keys()) {
        const root = ds.find(key);
        if (!groups.has(root)) {
            groups.set(root, []);
        }
        groups.get(root)?.push(pixelMap.get(key) as Pixel);
    }

    // Calculate bounding boxes
    const boundingBoxes: BoundingBox[] = [];
    for (const pixels of groups.values()) {
        let left = Infinity;
        let top = Infinity;
        let right = -Infinity;
        let bottom = -Infinity;

        for (const pixel of pixels) {
            if (pixel.x < left) left = pixel.x;
            if (pixel.y < top) top = pixel.y;
            if (pixel.x > right) right = pixel.x;
            if (pixel.y > bottom) bottom = pixel.y;
        }

        boundingBoxes.push({ left, top, right, bottom });
    }

    console.log(`Grouping time: ${Date.now() - groupingStartTime}ms`);
    const totalAnalysisTime = Date.now() - totalStartTime;
    console.log(`Total analysis time: ${totalAnalysisTime}ms`);

    // Post-process to merge nearby bounding boxes
    console.log('Post-processing bounding boxes');
    const postProcessStartTime = Date.now();

    const mergedBoxes = mergeBoundingBoxes(boundingBoxes, proximity);

    console.log(`Post-processing time: ${Date.now() - postProcessStartTime}ms`);
    console.log(`Number merged: ${mergedBoxes.length}`);

    return mergedBoxes;
}

/**
 * Function to merge nearby bounding boxes.
 */
function mergeBoundingBoxes(boxes: BoundingBox[], proximity: number): BoundingBox[] {
    const merged: BoundingBox[] = [];

    while (boxes.length) {
        const box = boxes.pop()!;
        let mergedWithAnotherBox = false;

        for (let i = 0; i < boxes.length; i++) {
            const otherBox = boxes[i];

            if (
                box.left <= otherBox.right + proximity &&
                box.right >= otherBox.left - proximity &&
                box.top <= otherBox.bottom + proximity &&
                box.bottom >= otherBox.top - proximity
            ) {
                boxes.splice(i, 1);
                boxes.push({
                    left: Math.min(box.left, otherBox.left),
                    top: Math.min(box.top, otherBox.top),
                    right: Math.max(box.right, otherBox.right),
                    bottom: Math.max(box.bottom, otherBox.bottom),
                });
                mergedWithAnotherBox = true;
                break;
            }
        }

        if (!mergedWithAnotherBox) {
            merged.push(box);
        }
    }

    return merged;
}

parentPort?.on('message', ({ diffPixels, proximity }: { diffPixels: Pixel[], proximity: number }) => {
    const boundingBoxes = processDiffPixels(diffPixels, proximity);
    parentPort?.postMessage(boundingBoxes);
});
