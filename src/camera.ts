import { identity, inverse, multiply, perspective, rotate, translate } from 'src/m4';

const LATERAL_SPEED = 0.4;
const FORWARDS_SPEED = 0.4;
const BACKWARDS_SPEED = 0.4;

const MIN_PITCH = (Math.PI * 30) / 180;

export function createCamera(yFov: number, aspect: number, zNear: number, zFar: number, position: number[], yaw: number, pitch: number, roll: number) {
    return {
        center: new Float32Array(position),
        yaw: 0,
        pitch: 0,
        roll: 0,
        keys: {
            up: false,
            down: false,
            left: false,
            right: false,
            front: false,
            back: false
        },
        viewProjection() {
            const camera = translate(identity(), this.center);

            rotate(camera, new Float32Array([0, -1, 0]), this.yaw, camera);
            rotate(camera, new Float32Array([-1, 0, 0]), this.pitch, camera);
            rotate(camera, new Float32Array([0, 0, 1]), this.roll, camera);

            const viewProjection = multiply(perspective(yFov, aspect, zNear, zFar), inverse(camera));

            return viewProjection;
        },
        update(dt: number) {
            if (this.keys.right) {
                this.center[0] += Math.cos(this.yaw) * LATERAL_SPEED * dt;
                this.center[2] += Math.sin(this.yaw) * LATERAL_SPEED * dt;
            }
            if (this.keys.left) {
                this.center[0] -= Math.cos(this.yaw) * LATERAL_SPEED * dt;
                this.center[2] -= Math.sin(this.yaw) * LATERAL_SPEED * dt;
            }
            if (this.keys.back) {
                this.center[2] += Math.cos(this.yaw) * BACKWARDS_SPEED * dt;
                this.center[0] -= Math.sin(this.yaw) * BACKWARDS_SPEED * dt;
            }
            if (this.keys.front) {
                this.center[2] -= Math.cos(this.yaw) * FORWARDS_SPEED * dt;
                this.center[0] += Math.sin(this.yaw) * FORWARDS_SPEED * dt;
            }
            if (this.keys.up) this.center[1] += 0.4 * dt;
            if (this.keys.down) this.center[1] -= 0.4 * dt;
        },
        registerKey(e: KeyboardEvent) {
            switch (e.key) {
                case 'w':
                case 'ArrowUp':
                    this.keys.front = true;
                    break;
                case 'a':
                case 'ArrowLeft':
                    this.keys.left = true;
                    break;
                case 's':
                case 'ArrowDown':
                    this.keys.back = true;
                    break;
                case 'd':
                case 'ArrowRight':
                    this.keys.right = true;
                    break;
                case 'r':
                    this.keys.up = true;
                    break;
                case 'f':
                    this.keys.down = true;
                    break;
            }
        },
        deregisterKey(e: KeyboardEvent) {
            {
                switch (e.key) {
                    case 'w':
                    case 'ArrowUp':
                        this.keys.front = false;
                        break;
                    case 'a':
                    case 'ArrowLeft':
                        this.keys.left = false;
                        break;
                    case 's':
                    case 'ArrowDown':
                        this.keys.back = false;
                        break;
                    case 'd':
                    case 'ArrowRight':
                        this.keys.right = false;
                        break;
                    case 'r':
                        this.keys.up = false;
                        break;
                    case 'f':
                        this.keys.down = false;
                        break;
                }
            }
        },
        capturePointer(e: PointerEvent) {
            // if (!document.pointerLockElement) return

            this.yaw += (0.8 * Math.PI * e.movementX) / 180;
            this.pitch += (0.8 * Math.PI * e.movementY) / 180;
            this.pitch = Math.max(Math.min(this.pitch, MIN_PITCH), -MIN_PITCH);
        }
    };
}
