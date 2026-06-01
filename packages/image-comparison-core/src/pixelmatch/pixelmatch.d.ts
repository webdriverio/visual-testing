declare module 'pixelmatch' {
    interface PixelmatchOptions {
        threshold?: number;
        includeAA?: boolean;
        alpha?: number;
        aaColor?: readonly [number, number, number];
        diffColor?: readonly [number, number, number];
        diffColorAlt?: readonly [number, number, number] | null;
        diffMask?: boolean;
    }

    function pixelmatch(
        img1: Buffer | Uint8Array,
        img2: Buffer | Uint8Array,
        output: Buffer | Uint8Array | null,
        width: number,
        height: number,
        options?: PixelmatchOptions
    ): number;

    export = pixelmatch;
}
