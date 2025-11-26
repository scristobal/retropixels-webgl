import { identity, inverse, multiply, perspective, rotate, translate } from 'src/m4';

export function createCamera(yFov: number, aspect: number, zNear: number, zFar: number, state: State) {
    return {
        movement: createMovement(state),
        viewProjection() {
            const camera = translate(identity(), this.movement.center);
            const viewProjection = multiply(perspective(yFov, aspect, zNear, zFar), inverse(camera));
            rotate(viewProjection, this.movement.axis, this.movement.angle, viewProjection);

            return viewProjection;
        },
        update(delta: number) {
            if (inputHandler.right) this.movement.moveRight(delta);
            if (inputHandler.left) this.movement.moveLeft(delta);
            if (inputHandler.up) this.movement.moveUp(delta);
            if (inputHandler.down) this.movement.moveDown(delta);
            if (inputHandler.turnRight) this.movement.rotateClockWise(delta);
            if (inputHandler.turnLeft) this.movement.rotateCounterClockWise(delta);
            if (inputHandler.back) this.movement.moveBack(delta);
            if (inputHandler.front) this.movement.moveFront(delta);
        }
    };
}

type State = {
    location: { center: number[]; speed: number[] };
    rotation: { axis: number[]; angle: number; speed: number };
};

export function createMovement(state: State) {
    return {
        center: new Float32Array(state.location.center),
        _speed: new Float32Array(state.location.speed),
        axis: new Float32Array(state.rotation.axis),
        angle: state.rotation.angle,
        _angleSpeed: state.rotation.speed,

        moveRight(dt: number) {
            this.center[0] += this._speed[0] * dt;
        },
        moveLeft(dt: number) {
            this.center[0] -= this._speed[0] * dt;
        },
        moveUp(dt: number) {
            this.center[1] += this._speed[1] * dt;
        },
        moveDown(dt: number) {
            this.center[1] -= this._speed[1] * dt;
        },
        moveBack(dt: number) {
            this.center[2] += this._speed[2] * dt;
        },
        moveFront(dt: number) {
            this.center[2] -= this._speed[2] * dt;
        },
        rotateClockWise(dt: number) {
            this.angle -= this._angleSpeed * dt;
        },
        rotateCounterClockWise(dt: number) {
            this.angle += this._angleSpeed * dt;
        }
    };
}

export const inputHandler = {
    up: false,
    down: false,
    left: false,
    right: false,
    turnLeft: false,
    turnRight: false,
    front: false,
    back: false
};

window.onkeydown = (e) => {
    switch (e.key) {
        case 'w':
        case 'ArrowUp':
            inputHandler.up = true;
            break;
        case 'a':
        case 'ArrowLeft':
            inputHandler.left = true;
            break;
        case 's':
        case 'ArrowDown':
            inputHandler.down = true;
            break;
        case 'd':
        case 'ArrowRight':
            inputHandler.right = true;
            break;
        case 'q':
            inputHandler.turnLeft = true;
            break;
        case 'e':
            inputHandler.turnRight = true;
            break;
        case 'r':
            inputHandler.back = true;
            break;
        case 'f':
            inputHandler.front = true;
            break;
    }
};

window.onkeyup = (e) => {
    switch (e.key) {
        case 'w':
        case 'ArrowUp':
            inputHandler.up = false;
            break;
        case 'a':
        case 'ArrowLeft':
            inputHandler.left = false;
            break;
        case 's':
        case 'ArrowDown':
            inputHandler.down = false;
            break;
        case 'd':
        case 'ArrowRight':
            inputHandler.right = false;
            break;
        case 'q':
            inputHandler.turnLeft = false;
            break;
        case 'e':
            inputHandler.turnRight = false;
            break;
        case 'r':
            inputHandler.back = false;
            break;
        case 'f':
            inputHandler.front = false;
            break;
    }
};
