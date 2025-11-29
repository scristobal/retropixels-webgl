import { identity, inverse, multiply, perspective, rotate, translate } from 'src/m4';

const LATERAL_SPEED = 0.4;
const FORWARDS_SPEED = 0.4;
const BACKWARDS_SPEED = 0.4;

export function createCamera(yFov: number, aspect: number, zNear: number, zFar: number, position: number[]) {
    const camera = {
        center: new Float32Array(position),
        yaw: 0,
        pitch: 0,
        roll: 0,

        viewProjection() {
            const camera = translate(identity(), this.center);

            // console.log("yaw", this.yaw, "\npitch", this.pitch);

            rotate(camera, new Float32Array([0, -1, 0]), this.yaw, camera);
            rotate(camera, new Float32Array([-1, 0, 0]), this.pitch, camera);
            rotate(camera, new Float32Array([0, 0, 1]), this.roll, camera);

            const viewProjection = multiply(perspective(yFov, aspect, zNear, zFar), inverse(camera));

            return viewProjection;
        },
        update(dt: number) {
            if (inputHandler.right) {
                this.center[0] += Math.cos(this.yaw) * LATERAL_SPEED * dt;
                this.center[2] += Math.sin(this.yaw) * LATERAL_SPEED * dt;
            }
            if (inputHandler.left) {
                this.center[0] -= Math.cos(this.yaw) * LATERAL_SPEED * dt;
                this.center[2] -= Math.sin(this.yaw) * LATERAL_SPEED * dt;
            }
            if (inputHandler.back) {
                this.center[2] += Math.cos(this.yaw) * BACKWARDS_SPEED * dt;
                this.center[0] -= Math.sin(this.yaw) * BACKWARDS_SPEED * dt;
            }
            if (inputHandler.front) {
                this.center[2] -= Math.cos(this.yaw) * FORWARDS_SPEED * dt;
                this.center[0] += Math.sin(this.yaw) * FORWARDS_SPEED * dt;
            }
            if (inputHandler.up) this.center[1] += 0.4 * dt;
            if (inputHandler.down) this.center[1] -= 0.4 * dt;
        }
    };

    document.addEventListener('mousemove', (e) => {
        if (document.pointerLockElement === null) return;

        console.log("movementX:", e.movementX, "movementY:", e.movementY, "screenX:", e.screenX, "screenY:", e.screenY);

        camera.yaw += (0.8 * Math.PI * e.movementX) / 180;
        camera.pitch = Math.max(Math.min(camera.pitch + (0.8 * Math.PI * e.movementY) / 180, Math.PI * 30 / 180), - Math.PI * 30 / 180);
    });

    return camera;
}

export const inputHandler = {
    up: false,
    down: false,
    left: false,
    right: false,
    front: false,
    back: false
};

document.onkeydown = (e) => {
    switch (e.key) {
        case 'w':
        case 'ArrowUp':
            inputHandler.front = true;
            break;
        case 'a':
        case 'ArrowLeft':
            inputHandler.left = true;
            break;
        case 's':
        case 'ArrowDown':
            inputHandler.back = true;
            break;
        case 'd':
        case 'ArrowRight':
            inputHandler.right = true;
            break;
        case 'r':
            inputHandler.up = true;
            break;
        case 'f':
            inputHandler.down = true;
            break;
    }
};

document.onkeyup = (e) => {
    switch (e.key) {
        case 'w':
        case 'ArrowUp':
            inputHandler.front = false;
            break;
        case 'a':
        case 'ArrowLeft':
            inputHandler.left = false;
            break;
        case 's':
        case 'ArrowDown':
            inputHandler.back = false;
            break;
        case 'd':
        case 'ArrowRight':
            inputHandler.right = false;
            break;
        case 'r':
            inputHandler.up = false;
            break;
        case 'f':
            inputHandler.down = false;
            break;
    }
};
