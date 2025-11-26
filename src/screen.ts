/**
 *
 * Resize canvas and contents correctly
 *
 */

export function screenManager(resolution: [number, number], maxTextureDimension: number, canvasElement: HTMLCanvasElement) {
    const canvas = { width: canvasElement.width, height: canvasElement.height };

    let resizeFlag = false;

    const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
            const contentBoxSize = entry.contentBoxSize[0];

            if (!contentBoxSize) continue;

            resizeFlag = true;

            canvas.width = Math.max(1, Math.min(contentBoxSize.inlineSize, maxTextureDimension));
            canvas.height = Math.max(1, Math.min(contentBoxSize.blockSize, maxTextureDimension));
        }
    });

    observer.observe(canvasElement);

    return {
        render: { width: resolution[0], height: resolution[1], ratio: resolution[0] / resolution[1] },

        get viewPort() {
            const fx = Math.floor(canvas.width / this.render.width);
            const fy = Math.floor(canvas.height / this.render.height);
            const f = Math.max(Math.min(fx, fy), 1);

            const x = (canvas.width - f * this.render.width) / 2;
            const y = (canvas.height - f * this.render.height) / 2;

            const width = f * this.render.width;
            const height = f * this.render.height;

            return { x, y, width, height };
        },

        get needsResize() {
            if (!resizeFlag) return false;

            canvasElement.width = canvas.width;
            canvasElement.height = canvas.height;

            resizeFlag = false;

            return true;
        }
    };
}
