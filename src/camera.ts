import { inv, identity as matIdentity, mult, perspective, translate } from 'src/homog';
import { identity, normalize, projectXZ, quat, quatIntoLookTo, quatIntoMatrix, quatIntoRight, quatMult, rotateX, rotateY } from './quats';

const STRAFE_SPEED = 0.4;
const FORWARD_SPEED = 0.4;
const BACKWARD_SPEED = 0.4;
const VERT_SPEED = 0.4;

const _MIN_PITCH = (Math.PI * 30) / 180;
const _MAX_PITCH = (Math.PI * 150) / 180;

export function createCamera(yFov: number, aspect: number, zNear: number, zFar: number, position: number[], direction: number[]) {
    return {
        center: new Float32Array(position),
        orientation: quat(direction),
        keys: {
            up: false,
            down: false,
            left: false,
            right: false,
            front: false,
            back: false
        },
        viewProjection() {
            const camera = translate(matIdentity(), this.center);

            const rotMat = quatIntoMatrix(this.orientation);
            const cameraTransform = mult(camera, rotMat);

            const viewProjection = mult(perspective(yFov, aspect, zNear, zFar), inv(cameraTransform));

            return viewProjection;
        },
        update(dt: number) {
            const forwardXZ = projectXZ(quatIntoLookTo(this.orientation));
            const rightXZ = projectXZ(quatIntoRight(this.orientation));

            if (this.keys.right) {
                this.center[0] += rightXZ[0] * STRAFE_SPEED * dt;
                this.center[2] += rightXZ[2] * STRAFE_SPEED * dt;
            }
            if (this.keys.left) {
                this.center[0] -= rightXZ[0] * STRAFE_SPEED * dt;
                this.center[2] -= rightXZ[2] * STRAFE_SPEED * dt;
            }
            if (this.keys.back) {
                this.center[0] += forwardXZ[0] * BACKWARD_SPEED * dt;
                this.center[2] += forwardXZ[2] * BACKWARD_SPEED * dt;
            }
            if (this.keys.front) {
                this.center[0] -= forwardXZ[0] * FORWARD_SPEED * dt;
                this.center[2] -= forwardXZ[2] * FORWARD_SPEED * dt;
            }
            if (this.keys.up) this.center[1] += VERT_SPEED * dt;
            if (this.keys.down) this.center[1] -= VERT_SPEED * dt;
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

            const yawDelta = -(0.8 * Math.PI * e.movementX) / 180;
            const pitchDelta = -(0.8 * Math.PI * e.movementY) / 180;

            const yawQuat = rotateY(yawDelta);
            quatMult(yawQuat, this.orientation, this.orientation);

            const pitchQuat = rotateX(pitchDelta);
            quatMult(this.orientation, pitchQuat, this.orientation);

            normalize(this.orientation, this.orientation);
        }
    };
}
