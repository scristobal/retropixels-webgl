import { expect, test } from 'vitest';
import { m4 } from './m4';

test('identity does nothing', () => {
    const x = new Float32Array([1, 1, 0, 1]);
    const tx = m4().identity.apply(x);

    expect(tx).toEqual(x);
});

test('translate moves point by offset', () => {
    const point = new Float32Array([1, 2, 3, 1]);
    const translation = new Float32Array([5, 10, 15]);
    const result = m4().identity.translate(translation).apply(point);

    expect(result).toEqual(new Float32Array([6, 12, 18, 1]));
});

test('multiply performs correct matrix multiplication', () => {
    // Matrix A
    const matrixA = new Float32Array([
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 16
    ]);

    // Matrix B
    const matrixB = new Float32Array([
        2, 0, 1, 0,
        0, 3, 0, 1,
        1, 0, 2, 0,
        0, 1, 0, 3
    ]);

    // Expected result of A * B
    const expected = new Float32Array([
        11, 14, 17, 20,
        28, 32, 36, 40,
        19, 22, 25, 28,
        44, 48, 52, 56
    ]);

    const result = m4().new(matrixA).multiply(matrixB).data;

    expect(result).toEqual(expected);
});
