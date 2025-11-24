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
