/// 3-dim homogeneus matrix operations

export function identity() {
    // biome-ignore format: custom matrix alignment
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}

export function ortho(width: number, height: number, depth: number) {
    // biome-ignore format: custom matrix alignment
    return new Float32Array([
        2 / width,           0,         0, 0,
                0, -2 / height,         0, 0,
                0,           0, 2 / depth, 0,
               -1,           1,         0, 1
    ]);
}

export function perspective(yFov: number, aspect: number, zNear: number, zFar: number) {
    const f = Math.tan(0.5 * (Math.PI - (yFov * Math.PI) / 180));
    const rInv = 1 / (zNear - zFar);

    // biome-ignore format: custom matrix alignment
    return new Float32Array([
        f / aspect, 0,                       0,  0,
                 0, f,                       0,  0,
                 0, 0,   (zNear + zFar) * rInv, -1,
                 0, 0, 2 * zNear * zFar * rInv,  0
    ]);
}

export function mult(lhs: Float32Array, rhs: Float32Array, dst?: Float32Array) {
    const t = dst || new Float32Array(16);
    // biome-ignore format: custom matrix alignment
    t.set([
        lhs[0] * rhs[0] + lhs[4] * rhs[1] + lhs[8] * rhs[2] + lhs[12] * rhs[3],
        lhs[1] * rhs[0] + lhs[5] * rhs[1] + lhs[9] * rhs[2] + lhs[13] * rhs[3],
        lhs[2] * rhs[0] + lhs[6] * rhs[1] + lhs[10] * rhs[2] + lhs[14] * rhs[3],
        lhs[3] * rhs[0] + lhs[7] * rhs[1] + lhs[11] * rhs[2] + lhs[15] * rhs[3],

        lhs[0] * rhs[4] + lhs[4] * rhs[5] + lhs[8] * rhs[6] + lhs[12] * rhs[7],
        lhs[1] * rhs[4] + lhs[5] * rhs[5] + lhs[9] * rhs[6] + lhs[13] * rhs[7],
        lhs[2] * rhs[4] + lhs[6] * rhs[5] + lhs[10] * rhs[6] + lhs[14] * rhs[7],
        lhs[3] * rhs[4] + lhs[7] * rhs[5] + lhs[11] * rhs[6] + lhs[15] * rhs[7],

        lhs[0] * rhs[8] + lhs[4] * rhs[9] + lhs[8] * rhs[10] + lhs[12] * rhs[11],
        lhs[1] * rhs[8] + lhs[5] * rhs[9] + lhs[9] * rhs[10] + lhs[13] * rhs[11],
        lhs[2] * rhs[8] + lhs[6] * rhs[9] + lhs[10] * rhs[10] + lhs[14] * rhs[11],
        lhs[3] * rhs[8] + lhs[7] * rhs[9] + lhs[11] * rhs[10] + lhs[15] * rhs[11],

        lhs[0] * rhs[12] + lhs[4] * rhs[13] + lhs[8] * rhs[14] + lhs[12] * rhs[15],
        lhs[1] * rhs[12] + lhs[5] * rhs[13] + lhs[9] * rhs[14] + lhs[13] * rhs[15],
        lhs[2] * rhs[12] + lhs[6] * rhs[13] + lhs[10] * rhs[14] + lhs[14] * rhs[15],
        lhs[3] * rhs[12] + lhs[7] * rhs[13] + lhs[11] * rhs[14] + lhs[15] * rhs[15]
    ]);
    return t;
}

export function inv(m: Float32Array, dst?: Float32Array) {
    const t = dst || new Float32Array(16);

    const b01 = m[0] * m[5] - m[1] * m[4];
    const b02 = m[0] * m[6] - m[2] * m[4];
    const b03 = m[0] * m[7] - m[3] * m[4];
    const b12 = m[1] * m[6] - m[2] * m[5];
    const b13 = m[1] * m[7] - m[3] * m[5];
    const b23 = m[2] * m[7] - m[3] * m[6];
    const c01 = m[8] * m[13] - m[9] * m[12];
    const c02 = m[8] * m[14] - m[10] * m[12];
    const c03 = m[8] * m[15] - m[11] * m[12];
    const c12 = m[9] * m[14] - m[10] * m[13];
    const c13 = m[9] * m[15] - m[11] * m[13];
    const c23 = m[10] * m[15] - m[11] * m[14];

    const det = b01 * c23 - b02 * c13 + b03 * c12 + b12 * c03 - b13 * c02 + b23 * c01;

    if (Math.abs(det) < 1e-10) {
        throw new Error('Matrix is not invertible (determinant is zero)');
    }

    const detInv = 1 / det;

    // biome-ignore format: custom matrix alignment
    t.set([
        (m[5] * c23 - m[6] * c13 + m[7] * c12) * detInv,
        (m[2] * c13 - m[1] * c23 - m[3] * c12) * detInv,
        (m[13] * b23 - m[14] * b13 + m[15] * b12) * detInv,
        (m[10] * b13 - m[9] * b23 - m[11] * b12) * detInv,

        (m[6] * c03 - m[4] * c23 - m[7] * c02) * detInv,
        (m[0] * c23 - m[2] * c03 + m[3] * c02) * detInv,
        (m[14] * b03 - m[12] * b23 - m[15] * b02) * detInv,
        (m[8] * b23 - m[10] * b03 + m[11] * b02) * detInv,

        (m[4] * c13 - m[5] * c03 + m[7] * c01) * detInv,
        (m[1] * c03 - m[0] * c13 - m[3] * c01) * detInv,
        (m[12] * b13 - m[13] * b03 + m[15] * b01) * detInv,
        (m[9] * b03 - m[8] * b13 - m[11] * b01) * detInv,

        (m[5] * c02 - m[4] * c12 - m[6] * c01) * detInv,
        (m[0] * c12 - m[1] * c02 + m[2] * c01) * detInv,
        (m[13] * b02 - m[12] * b12 - m[14] * b01) * detInv,
        (m[8] * b12 - m[9] * b02 + m[10] * b01) * detInv
    ]);

    return t;
}

export function apply(m: Float32Array, v: Float32Array, dst?: Float32Array) {
    const t = dst || new Float32Array(4);
    // biome-ignore format: custom matrix alignment
    t.set([
        v[0] * m[0] + v[1] * m[4] + v[2] * m[ 8] + v[3] * m[12],
        v[0] * m[1] + v[1] * m[5] + v[2] * m[ 9] + v[3] * m[13],
        v[0] * m[2] + v[1] * m[6] + v[2] * m[10] + v[3] * m[14],
        v[0] * m[3] + v[1] * m[7] + v[2] * m[11] + v[3] * m[15],
    ]);
    return t;
}

export function _rotate(m: Float32Array, axis: Float32Array, angle: number, dst?: Float32Array) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    // biome-ignore format: custom matrix alignment
    const rotationMatrix = new Float32Array([
        axis[0] * axis[0] * (1 - cos) + cos,
        axis[0] * axis[1] * (1 - cos) + axis[2] * sin,
        axis[0] * axis[2] * (1 - cos) - axis[1] * sin,
        0,

        axis[0] * axis[1] * (1 - cos) - axis[2] * sin,
        axis[1] * axis[1] * (1 - cos) + cos,
        axis[1] * axis[2] * (1 - cos) + axis[0] * sin,
        0,

        axis[0] * axis[2] * (1 - cos) + axis[1] * sin,
        axis[1] * axis[2] * (1 - cos) - axis[0] * sin,
        axis[2] * axis[2] * (1 - cos) + cos,
        0,

        0, 0, 0, 1
    ]);
    return mult(m, rotationMatrix, dst);
}

export function scale(m: Float32Array, x: number, y: number, z: number, dst?: Float32Array) {
    // biome-ignore format: custom matrix alignment
    const scalingMatrix = new Float32Array([
        x, 0, 0, 0,
        0, y, 0, 0,
        0, 0, z, 0,
        0, 0, 0, 1
    ]);
    return mult(m, scalingMatrix, dst);
}

export function translate(m: Float32Array, x: number, y: number, z: number, dst?: Float32Array) {
    // biome-ignore format: custom matrix alignment
    const translationMatrix = new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        x, y, z, 1
    ]);
    return mult(m, translationMatrix, dst);
}
