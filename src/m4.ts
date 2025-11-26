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

export function projection(width: number, height: number, depth: number) {
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

export function rotationX(rd: number) {
    const c = Math.cos(rd);
    const s = Math.sin(rd);
    // biome-ignore format: custom matrix alignment
    return new Float32Array([
        1,  0,  0,  0,
        0,  c,  s,  0,
        0, -s,  c,  0,
        0,  0,  0,  1
    ]);
}

export function rotationY(rd: number) {
    const c = Math.cos(rd);
    const s = Math.sin(rd);
    // biome-ignore format: custom matrix alignment
    return new Float32Array([
        c,  0, -s,  0,
        0,  1,  0,  0,
        s,  0,  c,  0,
        0,  0,  0,  1
    ]);
}

export function rotationZ(rd: number) {
    const c = Math.cos(rd);
    const s = Math.sin(rd);
    // biome-ignore format: custom matrix alignment
    return new Float32Array([
         c,  s,  0,  0,
        -s,  c,  0,  0,
         0,  0,  1,  0,
         0,  0,  0,  1
    ]);
}

export function rotation(a: Float32Array, rd: number) {
    const c = Math.cos(rd);
    const s = Math.sin(rd);
    // biome-ignore format: custom matrix alignment
    return new Float32Array([
        a[0] * a[0] * (1 - c) + c,        a[0] * a[1] * (1 - c) + a[2] * s, a[0] * a[2] * (1 - c) - a[1] * s, 0,
        a[0] * a[1] * (1 - c) - a[2] * s, a[1] * a[1] * (1 - c) + c,        a[1] * a[2] * (1 - c) + a[0] * s, 0,
        a[0] * a[2] * (1 - c) + a[1] * s, a[1] * a[2] * (1 - c) - a[0] * s, a[2] * a[2] * (1 - c) + c,        0,
        0,                                0,                                0,                                1
    ]);
}

export function scaling(f: Float32Array) {
    // biome-ignore format: custom matrix alignment
    return new Float32Array([
        f[0],    0,    0, 0,
           0, f[1],    0, 0,
           0,    0, f[2], 0,
           0,    0,    0, 1
    ]);
}

export function translation(v: Float32Array) {
    // biome-ignore format: custom matrix alignment
    return new Float32Array([
           1,    0,    0, 0,
           0,    1,    0, 0,
           0,    0,    1, 0,
        v[0], v[1], v[2], 1
    ]);
}

export function multiply(lhs: Float32Array, rhs: Float32Array, dst?: Float32Array) {
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

export function inverse(m: Float32Array, dst?: Float32Array) {
    const t = dst || new Float32Array(16);

    const b = new Float32Array([
        m[0] * m[5] - m[1] * m[4],
        m[0] * m[6] - m[2] * m[4],
        m[0] * m[7] - m[3] * m[4],
        m[1] * m[6] - m[2] * m[5],
        m[1] * m[7] - m[3] * m[5],
        m[2] * m[7] - m[3] * m[6],
        m[8] * m[13] - m[9] * m[12],
        m[8] * m[14] - m[10] * m[12],
        m[8] * m[15] - m[11] * m[12],
        m[9] * m[14] - m[10] * m[13],
        m[9] * m[15] - m[11] * m[13],
        m[10] * m[15] - m[11] * m[14]
    ]);

    const det = b[0] * b[11] - b[1] * b[10] + b[2] * b[9] + b[3] * b[8] - b[4] * b[7] + b[5] * b[6];

    if (Math.abs(det) < 1e-10) {
        throw new Error('Matrix is not invertible (determinant is zero)');
    }

    const detInv = 1 / det;

    // biome-ignore format: custom matrix alignment
    t.set([
        (m[5] * b[11] - m[6] * b[10] + m[7] * b[9]) * detInv,
        (m[2] * b[10] - m[1] * b[11] - m[3] * b[9]) * detInv,
        (m[13] * b[5] - m[14] * b[4] + m[15] * b[3]) * detInv,
        (m[10] * b[4] - m[9] * b[5] - m[11] * b[3]) * detInv,

        (m[6] * b[8] - m[4] * b[11] - m[7] * b[7]) * detInv,
        (m[0] * b[11] - m[2] * b[8] + m[3] * b[7]) * detInv,
        (m[14] * b[2] - m[12] * b[5] - m[15] * b[1]) * detInv,
        (m[8] * b[5] - m[10] * b[2] + m[11] * b[1]) * detInv,

        (m[4] * b[10] - m[5] * b[8] + m[7] * b[6]) * detInv,
        (m[1] * b[8] - m[0] * b[10] - m[3] * b[6]) * detInv,
        (m[12] * b[4] - m[13] * b[2] + m[15] * b[0]) * detInv,
        (m[9] * b[2] - m[8] * b[4] - m[11] * b[0]) * detInv,

        (m[5] * b[7] - m[4] * b[9] - m[6] * b[6]) * detInv,
        (m[0] * b[9] - m[1] * b[7] + m[2] * b[6]) * detInv,
        (m[13] * b[1] - m[12] * b[3] - m[14] * b[0]) * detInv,
        (m[8] * b[3] - m[9] * b[1] + m[10] * b[0]) * detInv
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

export function rotateX(m: Float32Array, rd: number, dst?: Float32Array) {
    return multiply(m, rotationX(rd), dst);
}

export function rotateY(m: Float32Array, rd: number, dst?: Float32Array) {
    return multiply(m, rotationY(rd), dst);
}

export function rotateZ(m: Float32Array, rd: number, dst?: Float32Array) {
    return multiply(m, rotationZ(rd), dst);
}

export function rotate(m: Float32Array, a: Float32Array, rd: number, dst?: Float32Array) {
    return multiply(m, rotation(a, rd), dst);
}

export function scale(m: Float32Array, f: Float32Array, dst?: Float32Array) {
    return multiply(m, scaling(f), dst);
}

export function translate(m: Float32Array, v: Float32Array, dst?: Float32Array) {
    return multiply(m, translation(v), dst);
}
