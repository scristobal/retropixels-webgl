//
// zero chain matrix operations
//
// usage:
//  m4().identity.scale(s).translate(v).rotate(r,a).data;

export function m4() {
    return {
        data: new Float32Array(16),
        op: new Float32Array(16),
        get identity() {
            // biome-ignore format: custom matrix alignment
            this.data.set([
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
            ]);
            return this;
        },
        _projection: function (width: number, height: number, depth: number) {
            // biome-ignore format: custom matrix alignment
            this.data.set([
                2 / width,           0,         0, 0,
                        0, -2 / height,         0, 0,
                        0,           0, 2 / depth, 0,
                       -1,           1,         0, 1
            ]);
            return this;
        },
        perspective(yFov: number, aspect: number, zNear: number, zFar: number) {
            const f = Math.tan(0.5 * (Math.PI - (yFov * Math.PI) / 180));
            const rInv = 1 / (zNear - zFar);

            // biome-ignore format: custom matrix alignment
            this.data = new Float32Array([
                f / aspect, 0,                       0,  0,
                         0, f,                       0,  0,
                         0, 0,   (zNear + zFar) * rInv, -1,
                         0, 0, 2 * zNear * zFar * rInv,  0
            ]);

            return this;
        },
        new(data: Float32Array) {
            this.data.set(data);
            return this;
        },
        __apply() {
            const a00 = this.data[0],
                a01 = this.data[1],
                a02 = this.data[2],
                a03 = this.data[3];
            const a10 = this.data[4],
                a11 = this.data[5],
                a12 = this.data[6],
                a13 = this.data[7];
            const a20 = this.data[8],
                a21 = this.data[9],
                a22 = this.data[10],
                a23 = this.data[11];
            const a30 = this.data[12],
                a31 = this.data[13],
                a32 = this.data[14],
                a33 = this.data[15];

            const b00 = this.op[0],
                b01 = this.op[1],
                b02 = this.op[2],
                b03 = this.op[3];
            const b10 = this.op[4],
                b11 = this.op[5],
                b12 = this.op[6],
                b13 = this.op[7];
            const b20 = this.op[8],
                b21 = this.op[9],
                b22 = this.op[10],
                b23 = this.op[11];
            const b30 = this.op[12],
                b31 = this.op[13],
                b32 = this.op[14],
                b33 = this.op[15];

            const c00 = a00 * b00 + a10 * b01 + a20 * b02 + a30 * b03;
            const c01 = a01 * b00 + a11 * b01 + a21 * b02 + a31 * b03;
            const c02 = a02 * b00 + a12 * b01 + a22 * b02 + a32 * b03;
            const c03 = a03 * b00 + a13 * b01 + a23 * b02 + a33 * b03;

            const c10 = a00 * b10 + a10 * b11 + a20 * b12 + a30 * b13;
            const c11 = a01 * b10 + a11 * b11 + a21 * b12 + a31 * b13;
            const c12 = a02 * b10 + a12 * b11 + a22 * b12 + a32 * b13;
            const c13 = a03 * b10 + a13 * b11 + a23 * b12 + a33 * b13;

            const c20 = a00 * b20 + a10 * b21 + a20 * b22 + a30 * b23;
            const c21 = a01 * b20 + a11 * b21 + a21 * b22 + a31 * b23;
            const c22 = a02 * b20 + a12 * b21 + a22 * b22 + a32 * b23;
            const c23 = a03 * b20 + a13 * b21 + a23 * b22 + a33 * b23;

            const c30 = a00 * b30 + a10 * b31 + a20 * b32 + a30 * b33;
            const c31 = a01 * b30 + a11 * b31 + a21 * b32 + a31 * b33;
            const c32 = a02 * b30 + a12 * b31 + a22 * b32 + a32 * b33;
            const c33 = a03 * b30 + a13 * b31 + a23 * b32 + a33 * b33;

            // biome-ignore format: custom matrix alignment
            this.data.set([
                c00, c01, c02, c03,
                c10, c11, c12, c13,
                c20, c21, c22, c23,
                c30, c31, c32, c33
            ]);
            return this;
        },
        _rotateX(rd: number) {
            const c = Math.cos(rd);
            const s = Math.sin(rd);
            // biome-ignore format: custom matrix alignment
            this.op.set([
                1,  0, 0,
                0,  c, s,
                0, -s, c
            ])
            return this.__apply();
        },
        _rotateY(rd: number) {
            const c = Math.cos(rd);
            const s = Math.sin(rd);
            // biome-ignore format: custom matrix alignment
            this.op.set([
                c, 0, -s,
                0, 1,  0,
                s, 0,  c
            ])
            return this.__apply();
        },
        _rotateZ(rd: number) {
            const c = Math.cos(rd);
            const s = Math.sin(rd);
            // biome-ignore format: custom matrix alignment
            this.op.set([
                 c, s, 0,
                -s, c, 0,
                 0, 0, 1
            ])
            return this.__apply();
        },
        rotate(a: Float32Array, rd: number) {
            const c = Math.cos(rd);
            const s = Math.sin(rd);
            // biome-ignore format: custom matrix alignment
            this.op.set([
                a[0] * a[0] * (1 - c) + c,        a[0] * a[1] * (1 - c) + a[2] * s, a[0] * a[2] * (1 - c) - a[1] * s, 0,
                a[0] * a[1] * (1 - c) - a[2] * s,        a[1] * a[1] * (1 - c) + c, a[1] * a[2] * (1 - c) + a[0] * s, 0,
                a[0] * a[2] * (1 - c) + a[1] * s, a[1] * a[2] * (1 - c) - a[0] * s,        a[2] * a[2] * (1 - c) + c, 0,
                                               0,                                0,                                0, 1
            ]);
            return this.__apply();
        },
        scale(s: Float32Array) {
            // biome-ignore format: custom matrix alignment
            this.op.set([
                s[0],    0,    0, 0,
                   0, s[1],    0, 0,
                   0,    0, s[2], 0,
                   0,    0,    0, 1
            ]);
            return this.__apply();
        },
        translate(t: Float32Array) {
            // biome-ignore format: custom matrix alignment
            this.op.set([
                   1,      0,      0, 0,
                   0,      1,      0, 0,
                   0,      0,      1, 0,
                t[0],   t[1],   t[2], 1
            ]);
            return this.__apply();
        },
        multiply(rhs: Float32Array) {
            this.op.set(rhs);
            return this.__apply();
        },
        apply(vec: Float32Array) {
            // biome-ignore format: custom matrix alignment
            return new Float32Array([
                vec[0] * this.data[0] + vec[1] * this.data[4] + vec[2] * this.data[ 8] + vec[3] * this.data[12],
                vec[0] * this.data[1] + vec[1] * this.data[5] + vec[2] * this.data[ 9] + vec[3] * this.data[13],
                vec[0] * this.data[2] + vec[1] * this.data[6] + vec[2] * this.data[10] + vec[3] * this.data[14],
                vec[0] * this.data[3] + vec[1] * this.data[7] + vec[2] * this.data[11] + vec[3] * this.data[15],
            ]);
        },
        get inverse() {
            const a00 = this.data[0],
                a01 = this.data[1],
                a02 = this.data[2],
                a03 = this.data[3];
            const a10 = this.data[4],
                a11 = this.data[5],
                a12 = this.data[6],
                a13 = this.data[7];
            const a20 = this.data[8],
                a21 = this.data[9],
                a22 = this.data[10],
                a23 = this.data[11];
            const a30 = this.data[12],
                a31 = this.data[13],
                a32 = this.data[14],
                a33 = this.data[15];

            const b00 = a00 * a11 - a01 * a10;
            const b01 = a00 * a12 - a02 * a10;
            const b02 = a00 * a13 - a03 * a10;
            const b03 = a01 * a12 - a02 * a11;
            const b04 = a01 * a13 - a03 * a11;
            const b05 = a02 * a13 - a03 * a12;
            const b06 = a20 * a31 - a21 * a30;
            const b07 = a20 * a32 - a22 * a30;
            const b08 = a20 * a33 - a23 * a30;
            const b09 = a21 * a32 - a22 * a31;
            const b10 = a21 * a33 - a23 * a31;
            const b11 = a22 * a33 - a23 * a32;

            const det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

            if (Math.abs(det) < 1e-10) {
                throw new Error('Matrix is not invertible (determinant is zero)');
            }

            const detInv = 1 / det;

            const c00 = (a11 * b11 - a12 * b10 + a13 * b09) * detInv;
            const c01 = (a02 * b10 - a01 * b11 - a03 * b09) * detInv;
            const c02 = (a31 * b05 - a32 * b04 + a33 * b03) * detInv;
            const c03 = (a22 * b04 - a21 * b05 - a23 * b03) * detInv;

            const c10 = (a12 * b08 - a10 * b11 - a13 * b07) * detInv;
            const c11 = (a00 * b11 - a02 * b08 + a03 * b07) * detInv;
            const c12 = (a32 * b02 - a30 * b05 - a33 * b01) * detInv;
            const c13 = (a20 * b05 - a22 * b02 + a23 * b01) * detInv;

            const c20 = (a10 * b10 - a11 * b08 + a13 * b06) * detInv;
            const c21 = (a01 * b08 - a00 * b10 - a03 * b06) * detInv;
            const c22 = (a30 * b04 - a31 * b02 + a33 * b00) * detInv;
            const c23 = (a21 * b02 - a20 * b04 - a23 * b00) * detInv;

            const c30 = (a11 * b07 - a10 * b09 - a12 * b06) * detInv;
            const c31 = (a00 * b09 - a01 * b07 + a02 * b06) * detInv;
            const c32 = (a31 * b01 - a30 * b03 - a32 * b00) * detInv;
            const c33 = (a20 * b03 - a21 * b01 + a22 * b00) * detInv;

            // biome-ignore format: custom matrix alignment
            this.data.set([
                c00, c01, c02, c03,
                c10, c11, c12, c13,
                c20, c21, c22, c23,
                c30, c31, c32, c33
            ]);

            return this;
        }
    };
}
