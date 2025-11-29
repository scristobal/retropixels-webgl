/// Rotation using quaternions

import { mult } from './homog';

export function identity() {
    //  w + xi + yj + zk  =  x  y  z  w
    return new Float32Array([0, 0, 0, 1]);
}

export function quat(dir: number[]) {
    //  w + xi + yj + zk  =  x  y  z  w
    return new Float32Array([...dir, 1]);
}

export function quatMult(a: Float32Array, b: Float32Array, dst?: Float32Array) {
    const q = dst || new Float32Array(4);

    const ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3];
    const bx = b[0],
        by = b[1],
        bz = b[2],
        bw = b[3];

    q[0] = ax * bw + aw * bx + ay * bz - az * by;
    q[1] = ay * bw + aw * by + az * bx - ax * bz;
    q[2] = az * bw + aw * bz + ax * by - ay * bx;
    q[3] = aw * bw - ax * bx - ay * by - az * bz;

    return q;
}

export function normalize(q: Float32Array, dst?: Float32Array) {
    const t = dst || new Float32Array(4);
    const len = Math.sqrt(q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3]);

    if (len < 1e-10) {
        t.set([0, 0, 0, 1]);
        return t;
    }

    const invLen = 1 / len;
    t[0] = q[0] * invLen;
    t[1] = q[1] * invLen;
    t[2] = q[2] * invLen;
    t[3] = q[3] * invLen;

    return t;
}

export function quatIntoMatrix(q: Float32Array, dst?: Float32Array) {
    const m = dst || new Float32Array(16);

    const x = q[0],
        y = q[1],
        z = q[2],
        w = q[3];
    const x2 = x + x,
        y2 = y + y,
        z2 = z + z;
    const xx = x * x2,
        xy = x * y2,
        xz = x * z2;
    const yy = y * y2,
        yz = y * z2,
        zz = z * z2;
    const wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    // biome-ignore format: custom matrix alignment
    m.set([
        1 - (yy + zz), xy + wz,       xz - wy,       0,
        xy - wz,       1 - (xx + zz), yz + wx,       0,
        xz + wy,       yz - wx,       1 - (xx + yy), 0,
        0,             0,             0,             1
    ]);

    return m;
}

export function slerp(a: Float32Array, b: Float32Array, t: number, dst?: Float32Array) {
    const q = dst || new Float32Array(4);

    let dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];

    // shorter path for negative quaternions
    const bx = dot < 0 ? -b[0] : b[0];
    const by = dot < 0 ? -b[1] : b[1];
    const bz = dot < 0 ? -b[2] : b[2];
    const bw = dot < 0 ? -b[3] : b[3];
    dot = Math.abs(dot);

    let scale0: number, scale1: number;

    // fall back to linear interpolation
    if (dot > 0.9995) {
        scale0 = 1 - t;
        scale1 = t;
    } else {
        const theta = Math.acos(dot);
        const sinTheta = Math.sin(theta);
        scale0 = Math.sin((1 - t) * theta) / sinTheta;
        scale1 = Math.sin(t * theta) / sinTheta;
    }

    q[0] = scale0 * a[0] + scale1 * bx;
    q[1] = scale0 * a[1] + scale1 * by;
    q[2] = scale0 * a[2] + scale1 * bz;
    q[3] = scale0 * a[3] + scale1 * bw;

    return q;
}

export function eulerIntoQuat(pitch: number, yaw: number, roll: number, dst?: Float32Array) {
    const q = dst || new Float32Array(4);

    const halfPitch = pitch * 0.5;
    const halfYaw = yaw * 0.5;
    const halfRoll = roll * 0.5;

    const cp = Math.cos(halfPitch);
    const sp = Math.sin(halfPitch);
    const cy = Math.cos(halfYaw);
    const sy = Math.sin(halfYaw);
    const cr = Math.cos(halfRoll);
    const sr = Math.sin(halfRoll);

    q[0] = sr * cp * cy - cr * sp * sy;
    q[1] = cr * sp * cy + sr * cp * sy;
    q[2] = cr * cp * sy - sr * sp * cy;
    q[3] = cr * cp * cy + sr * sp * sy;

    return q;
}

export function axisAndAngleToQuat(axis: Float32Array, angle: number, dst?: Float32Array) {
    const q = dst || new Float32Array(4);
    const halfAngle = angle * 0.5;
    const s = Math.sin(halfAngle);

    const len = Math.sqrt(axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2]);
    if (len < 1e-10) {
        q.set([0, 0, 0, 1]);
        return q;
    }

    const invLen = 1 / len;
    q[0] = axis[0] * invLen * s;
    q[1] = axis[1] * invLen * s;
    q[2] = axis[2] * invLen * s;
    q[3] = Math.cos(halfAngle);

    return q;
}

export function eulerRotate(m: Float32Array, yaw: number, pitch: number, roll: number, dst?: Float32Array) {
    const q = eulerIntoQuat(pitch, yaw, roll);
    const rotMat = quatIntoMatrix(q);
    return mult(m, rotMat, dst);
}

export function rotate(m: Float32Array, axis: Float32Array, angle: number, dst?: Float32Array) {
    const q = axisAndAngleToQuat(axis, angle);
    const rotMat = quatIntoMatrix(q);
    return mult(m, rotMat, dst);
}

export function rotateX(angle: number, dst?: Float32Array) {
    return axisAndAngleToQuat(new Float32Array([1, 0, 0]), angle, dst);
}

export function rotateY(angle: number, dst?: Float32Array) {
    return axisAndAngleToQuat(new Float32Array([0, 1, 0]), angle, dst);
}

export function rotateZ(angle: number, dst?: Float32Array) {
    return axisAndAngleToQuat(new Float32Array([0, 0, 1]), angle, dst);
}

export function quatIntoLookTo(q: Float32Array, dst?: Float32Array) {
    const v = dst || new Float32Array(3);
    const rotMat = quatIntoMatrix(q);
    v[0] = rotMat[8];
    v[1] = rotMat[9];
    v[2] = rotMat[10];
    return v;
}

export function quatIntoRight(q: Float32Array, dst?: Float32Array) {
    const v = dst || new Float32Array(3);
    const rotMat = quatIntoMatrix(q);
    v[0] = rotMat[0];
    v[1] = rotMat[1];
    v[2] = rotMat[2];
    return v;
}

export function quatIntoUp(q: Float32Array, dst?: Float32Array) {
    const v = dst || new Float32Array(3);
    const rotMat = quatIntoMatrix(q);
    v[0] = rotMat[4];
    v[1] = rotMat[5];
    v[2] = rotMat[6];
    return v;
}

export function projectXZ(v: Float32Array, dst?: Float32Array) {
    const t = dst || new Float32Array(3);

    t[0] = v[0];
    t[1] = 0;
    t[2] = v[2];

    const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);

    if (len < 1e-10) {
        t.set([0, 0, 0]);
        return t;
    }

    const invLen = 1 / len;
    t[0] = v[0] * invLen;
    t[1] = v[1] * invLen;
    t[2] = v[2] * invLen;

    return t;
}
