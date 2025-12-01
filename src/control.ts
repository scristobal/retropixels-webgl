export const keys = {
    up: false,
    down: false,
    left: false,
    right: false,
    front: false,
    back: false
};

export function registerKey(e: KeyboardEvent) {
    switch (e.key) {
        case 'w':
        case 'ArrowUp':
            keys.front = true;
            break;
        case 'a':
        case 'ArrowLeft':
            keys.left = true;
            break;
        case 's':
        case 'ArrowDown':
            keys.back = true;
            break;
        case 'd':
        case 'ArrowRight':
            keys.right = true;
            break;
        case 'r':
            keys.up = true;
            break;
        case 'f':
            keys.down = true;
            break;
    }
}
export function deregisterKey(e: KeyboardEvent) {
    {
        switch (e.key) {
            case 'w':
            case 'ArrowUp':
                keys.front = false;
                break;
            case 'a':
            case 'ArrowLeft':
                keys.left = false;
                break;
            case 's':
            case 'ArrowDown':
                keys.back = false;
                break;
            case 'd':
            case 'ArrowRight':
                keys.right = false;
                break;
            case 'r':
                keys.up = false;
                break;
            case 'f':
                keys.down = false;
                break;
        }
    }
}

export const angles = {
    yaw: 0,
    pitch: 0
};

export function capturePointer(e: PointerEvent) {
    angles.yaw -= (0.8 * Math.PI * e.movementX) / 180;
    angles.pitch -= (0.8 * Math.PI * e.movementY) / 180;
}
