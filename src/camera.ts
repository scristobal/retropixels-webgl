import { identity, inv, mult, perspective, translate } from 'src/homog';
import { angles, keys } from './control';
import { eulerIntoQuat, projectXZ, quatIntoLookTo, quatIntoRight, rotate } from './quats';

const STRAFE_SPEED = 0.4;
const FORWARD_SPEED = 0.4;
const BACKWARD_SPEED = 0.4;
const VERT_SPEED = 0.4;

const _MIN_PITCH = (Math.PI * 30) / 180;
const _MAX_PITCH = (Math.PI * 150) / 180;

export function createCamera(x: number, y: number, z: number) {
    return {
        center: { x, y, z },
        view(dt: number) {
            const quat = eulerIntoQuat(angles.yaw, 0, angles.pitch);

            const forwardXZ = projectXZ(quatIntoLookTo(quat));
            const rightXZ = projectXZ(quatIntoRight(quat));

            if (keys.right) {
                this.center.x += rightXZ[0] * STRAFE_SPEED * dt;
                this.center.z += rightXZ[2] * STRAFE_SPEED * dt;
            }
            if (keys.left) {
                this.center.x -= rightXZ[0] * STRAFE_SPEED * dt;
                this.center.z -= rightXZ[2] * STRAFE_SPEED * dt;
            }
            if (keys.back) {
                this.center.x += forwardXZ[0] * BACKWARD_SPEED * dt;
                this.center.z += forwardXZ[2] * BACKWARD_SPEED * dt;
            }
            if (keys.front) {
                this.center.x -= forwardXZ[0] * FORWARD_SPEED * dt;
                this.center.z -= forwardXZ[2] * FORWARD_SPEED * dt;
            }
            if (keys.up) this.center.y += VERT_SPEED * dt;
            if (keys.down) this.center.y -= VERT_SPEED * dt;

            const camera = identity();
            translate(camera, this.center.x, this.center.y, this.center.z, camera);
            rotate(camera, quat, camera);

            return camera;
        }
    };
}
