import animationData from 'data/animation.json';
import quadFragmentShaderCode from 'shaders/quad.fragment.glsl?raw';
import quadVertexShaderCode from 'shaders/quad.vertex.glsl?raw';
import spriteFragmentShaderCode from 'shaders/sprite.fragment.glsl?raw';
import spriteVertexShaderCode from 'shaders/sprite.vertex.glsl?raw';
import { inputHandler } from 'src/input';
import { m4 } from 'src/m4';
import { createMovement } from 'src/movement';
import { screenManager } from 'src/screen';
import { spriteSheet } from 'src/sprites';
import { timeTrack } from 'src/time';

function createProgram(gl: WebGL2RenderingContext, vertexShaderCode: string, fragmentShaderCode: string) {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, vertexShaderCode);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, fragmentShaderCode);
    gl.compileShader(fragmentShader);

    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.deleteShader(vertexShader);

    gl.attachShader(program, fragmentShader);
    gl.deleteShader(fragmentShader);

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));

        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(vertexShader));
            gl.deleteShader(vertexShader);
            throw 'Failed to compile vertex shader';
        }

        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(fragmentShader));
            gl.deleteShader(fragmentShader);
            throw 'Failed to compile fragment shader';
        }

        gl.deleteProgram(program);
        throw 'Failed to link the program';
    }

    return program;
}

async function renderer(canvasElement: HTMLCanvasElement) {
    const gl = canvasElement.getContext('webgl2');
    if (!gl) throw 'WebGL2 not supported in this browser';

    const movement = createMovement({
        location: { center: [0, 0, 0], speed: [0.002, 0.002, 0.2] },
        rotation: { axis: [0, 0, 1], angle: 0, speed: 0.01 }
    });

    const sprite = await spriteSheet(animationData);

    const timeTracker = timeTrack();
    const screen = screenManager(1, gl.getParameter(gl.MAX_TEXTURE_SIZE), canvasElement);

    //
    //  0 - - - 1
    //  | A   / |
    //  |   /   |
    //  | /   B |
    //  2 - - - 3
    //
    // biome-ignore format: custom matrix alignment
    const spriteVerticesData = new Float32Array([
    //    x   y  z  u  v
         -1,  1, 0, 0, 0, // 0
          1,  1, 0, 1, 0, // 1
         -1, -1, 0, 0, 1, // 2
          1, -1, 0, 1, 1, // 3
    ]);
    // biome-ignore format: custom matrix alignment
    const spriteIndicesData = new Uint16Array([
        0, 2, 1, // A
        1, 2, 3  // B
    ]);

    let spriteModelTransform: Float32Array;
    let spriteTextureTransform: Float32Array;

    // globals
    // gl.enable(gl.CULL_FACE);
    // gl.cullFace(gl.BACK);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // 1st pass program, animated sprite
    const spriteProgram = createProgram(gl, spriteVertexShaderCode, spriteFragmentShaderCode);
    gl.useProgram(spriteProgram);

    const spriteVerticesCoordsLocation = gl.getAttribLocation(spriteProgram, 'a_coord');
    const spriteVerticesTextureCoordsLocation = gl.getAttribLocation(spriteProgram, 'a_texCoord');

    const spriteVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, spriteVerticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, spriteVerticesData, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(spriteVerticesCoordsLocation);
    gl.vertexAttribPointer(spriteVerticesCoordsLocation, 3, gl.FLOAT, false, 3 * 4 + 2 * 4, 0);

    gl.enableVertexAttribArray(spriteVerticesTextureCoordsLocation);
    gl.vertexAttribPointer(spriteVerticesTextureCoordsLocation, 2, gl.FLOAT, false, 3 * 4 + 2 * 4, 3 * 4);

    const spriteIndicesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, spriteIndicesBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, spriteIndicesData, gl.STATIC_DRAW);

    const spriteModelTransformUniformLocation = gl.getUniformLocation(spriteProgram, 'u_modelTransform');
    const spriteTextureTransformUniformLocation = gl.getUniformLocation(spriteProgram, 'u_texTransform');
    const spriteColorTextureUniformLocation = gl.getUniformLocation(spriteProgram, 'u_texColor');

    gl.uniform1i(spriteColorTextureUniformLocation, 0);

    gl.activeTexture(gl.TEXTURE0);
    const spriteTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, spriteTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, sprite.sheetSize.width, sprite.sheetSize.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, sprite.imgData);

    // 2nd pass program, (low) resolution scaling
    const quadProgram = createProgram(gl, quadVertexShaderCode, quadFragmentShaderCode);
    gl.useProgram(quadProgram);

    const quadTextureUniformLocation = gl.getUniformLocation(quadProgram, 'u_texColor');
    const quadDepthTextureUniformLocation = gl.getUniformLocation(quadProgram, 'u_texDepth');

    gl.activeTexture(gl.TEXTURE1);
    const quadTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, quadTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, screen.quadResolution[0], screen.quadResolution[1], 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.uniform1i(quadTextureUniformLocation, 1);

    gl.activeTexture(gl.TEXTURE2);
    const depthTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, depthTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, screen.quadResolution[0], screen.quadResolution[1], 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
    gl.uniform1i(quadDepthTextureUniformLocation, 2);

    const quadFrameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, quadFrameBuffer);
    gl.viewport(0, 0, screen.canvasResolution[0], screen.canvasResolution[1]);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, quadTexture, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0);

    let resize = false;

    const startCameraDistance = 1000;
    const endCameraDistance = 100;
    const transitionTime_s = 5;
    let p = 0;

    function update() {
        const delta = timeTracker();

        resize = screen.needsResize;

        if (inputHandler.right) movement.moveRight(delta);
        if (inputHandler.left) movement.moveLeft(delta);
        if (inputHandler.up) movement.moveUp(delta);
        if (inputHandler.down) movement.moveDown(delta);
        if (inputHandler.turnRight) movement.rotateClockWise(delta);
        if (inputHandler.turnLeft) movement.rotateCounterClockWise(delta);
        if (inputHandler.back) movement.moveBack(delta);
        if (inputHandler.front) movement.moveFront(delta);

        sprite.update(delta);

        const invCameraDistance = (1-p)/startCameraDistance + p/endCameraDistance;
        p = Math.min(1, p+0.001);

        // biome-ignore format: matrix pipeoperations
        const camera = m4()
            .identity
            .translate(new Float32Array([0, 0, 1/invCameraDistance]));

        const view = camera.inverse.data;

        // biome-ignore format: matrix pipe operations
        const viewProjection = m4()
            .perspective(60, screen.quadRatio, 1, 1000)
            .multiply(view);

        // biome-ignore format: matrix pipe operations
        const modelMatrix = viewProjection
            .scale(new Float32Array([34, 34, 1]))
            .translate(movement.center)
            .rotate(movement.axis, movement.angle);

        spriteModelTransform = modelMatrix.data;
        spriteTextureTransform = sprite.transform;
    }

    function render() {
        if (!gl) throw 'Canvas context lost';

        if (resize) {
            gl.activeTexture(gl.TEXTURE1);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, screen.quadResolution[0], screen.quadResolution[1], 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

            gl.activeTexture(gl.TEXTURE2);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, screen.quadResolution[0], screen.quadResolution[1], 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
        }

        // 1st pass draw sprite on quad
        gl.bindFramebuffer(gl.FRAMEBUFFER, quadFrameBuffer);
        gl.viewport(0, 0, screen.quadResolution[0], screen.quadResolution[1]);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(spriteProgram);

        gl.uniformMatrix4fv(spriteModelTransformUniformLocation, false, spriteModelTransform);
        gl.uniformMatrix4fv(spriteTextureTransformUniformLocation, false, spriteTextureTransform);

        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

        // 2nd pass draw quad on screen
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, screen.canvasResolution[0], screen.canvasResolution[1]);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(quadProgram);

        // Bind depth texture instead of color texture
        // gl.activeTexture(gl.TEXTURE1);
        // gl.bindTexture(gl.TEXTURE_2D, depthTexture);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    return function gameLoop() {
        update();
        render();

        requestAnimationFrame(gameLoop);
    };
}

const version = import.meta.env.VITE_APP_VERSION;
console.log(`Version ${version}`);

const initTime = performance.now();

const canvasElement = document.querySelector('canvas');
if (!canvasElement) throw 'No canvasElement';

renderer(canvasElement)
    .then(requestAnimationFrame)
    .catch(console.error)
    .finally(() => console.log(`Ready in ${(performance.now() - initTime).toFixed(3)}ms`));
