import { apply, identity, inverse, multiply, translate } from 'src/m4';
import { expect, test } from 'vitest';

test('identity does nothing', () => {
    const x = new Float32Array([1, 1, 0, 1]);
    const tx = apply(identity(), x);

    expect(tx).toEqual(x);
});

test('translate moves point by offset', () => {
    const point = new Float32Array([1, 2, 3, 1]);
    const translation = new Float32Array([5, 10, 15]);
    const result = apply(translate(identity(), translation), point);

    expect(result).toEqual(new Float32Array([6, 12, 18, 1]));
});

test('multiply performs correct matrix multiplication', () => {
    // Matrix A
    const matrixA = new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);

    // Matrix B
    const matrixB = new Float32Array([2, 0, 1, 0, 0, 3, 0, 1, 1, 0, 2, 0, 0, 1, 0, 3]);

    // Expected result of A * B
    const expected = new Float32Array([11, 14, 17, 20, 28, 32, 36, 40, 19, 22, 25, 28, 44, 48, 52, 56]);

    const result = multiply(matrixA, matrixB);

    expect(result).toEqual(expected);
});

test('inverse produces correct inverse matrix', () => {
    // Create a transformation matrix
    const matrix = new Float32Array([2, 0, 0, 0, 0, 3, 0, 0, 0, 0, 4, 0, 5, 6, 7, 1]);

    // Expected inverse (computed manually)
    const expectedInverse = new Float32Array([0.5, 0, 0, 0, 0, 1 / 3, 0, 0, 0, 0, 0.25, 0, -2.5, -2, -1.75, 1]);

    const result = inverse(matrix);

    // Check each element is close (accounting for floating point precision)
    for (let i = 0; i < 16; i++) {
        expect(result[i]).toBeCloseTo(expectedInverse[i], 10);
    }
});

test('inverse times original equals identity', () => {
    // Create a transformation matrix
    const original = new Float32Array([2, 0, 0, 0, 0, 3, 0, 0, 0, 0, 4, 0, 5, 6, 7, 1]);

    const inv = inverse(original);
    const result = multiply(original, inv);

    // Result should be close to identity
    const identityMatrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

    for (let i = 0; i < 16; i++) {
        expect(result[i]).toBeCloseTo(identityMatrix[i], 10);
    }
});
