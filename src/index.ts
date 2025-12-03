import animationData from 'data/animation.json';
import quadFragmentShaderCode from 'shaders/quad.fragment.glsl?raw';
import quadVertexShaderCode from 'shaders/quad.vertex.glsl?raw';
import spriteFragmentShaderCode from 'shaders/sprite.fragment.glsl?raw';
import spriteVertexShaderCode from 'shaders/sprite.vertex.glsl?raw';
import { createCamera } from 'src/camera';
import { capturePointer, deregisterKey, registerKey } from 'src/control';
import { inv, mult, perspective, scale, translate } from 'src/mat4';
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

async function renderer(canvas: HTMLCanvasElement) {
    canvas.addEventListener('click', async () => {
        await canvas.requestPointerLock({
            unadjustedMovement: true
        });
    });

    const gl = canvas.getContext('webgl2');
    if (!gl) throw 'WebGL2 not supported in this browser';

    const timeTracker = timeTrack();
    const screen = screenManager([320, 200], gl.getParameter(gl.MAX_TEXTURE_SIZE), canvas);

    const projection = perspective(110, 1, 1, 1_000);
    const camera = createCamera(0, 10, 500);

    document.onkeydown = registerKey;
    document.onkeyup = deregisterKey;
    document.onpointermove = capturePointer;

    const sprite = await spriteSheet(animationData);

    //
    //  0 - - - 1
    //  | A   / |
    //  |   /   |
    //  | /   B |
    //  2 - - - 3
    //
    // biome-ignore format: custom matrix alignment
    const spriteVerts = new Float32Array([
    //    x   y   z   u   v
         -1,  1,  0,  0,  0, // 0
          1,  1,  0,  1,  0, // 1
         -1, -1,  0,  0,  1, // 2
          1, -1,  0,  1,  1, // 3
    ]);
    // biome-ignore format: custom matrix alignment
    const spriteInds = new Uint16Array([
        0, 2, 1, // A
        1, 2, 3, // B
    ]);

    const numSpriteInstances = 20;
    const spriteModelTransform = new Float32Array(numSpriteInstances * 4 * 4);

    const spriteTextureTransform = new Float32Array(16);

    // gl.enable(gl.CULL_FACE);
    // gl.cullFace(gl.BACK);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // 1st pass program, animated sprite
    const spriteProg = createProgram(gl, spriteVertexShaderCode, spriteFragmentShaderCode);
    gl.useProgram(spriteProg);

    const spriteCoordsLoc = 0; // gl.getAttribLocation(spriteProg, 'a_coord');
    const spriteTexCoordsLoc = 1; // gl.getAttribLocation(spriteProg, 'a_texCoord');
    const spriteModelTransformLoc = 2; // gl.getAttribLocation(spriteProg, 'a_modelTransform');

    const spriteVertBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, spriteVertBuf);
    gl.bufferData(gl.ARRAY_BUFFER, spriteVerts, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(spriteCoordsLoc);
    gl.vertexAttribPointer(spriteCoordsLoc, 3, gl.FLOAT, false, (3 + 2) * 4, 0);

    gl.enableVertexAttribArray(spriteTexCoordsLoc);
    gl.vertexAttribPointer(spriteTexCoordsLoc, 2, gl.FLOAT, false, (3 + 2) * 4, 3 * 4);

    const spriteModelTransformBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, spriteModelTransformBuf);
    gl.bufferData(gl.ARRAY_BUFFER, numSpriteInstances * 4 * 4 * 4, gl.DYNAMIC_DRAW);

    // mat4 in WebGL requires to assemble four consecutive vec4
    for (let i = 0; i < 4; i++) {
        const loc = spriteModelTransformLoc + i;
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, 4 * 4 * 4, i * 4 * 4);
        gl.vertexAttribDivisor(loc, 1);
    }

    const spriteIndsBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, spriteIndsBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, spriteInds, gl.STATIC_DRAW);

    const spriteTexTransformLoc = gl.getUniformLocation(spriteProg, 'u_texTransform');
    const spriteTexColorLoc = gl.getUniformLocation(spriteProg, 'u_texColor');

    gl.uniform1i(spriteTexColorLoc, 0);

    gl.activeTexture(gl.TEXTURE0);
    const spriteTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, spriteTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, sprite.sheetSize.width, sprite.sheetSize.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, sprite.imgData);

    // 2nd pass program, (low) resolution scaling
    const quadProg = createProgram(gl, quadVertexShaderCode, quadFragmentShaderCode);
    gl.useProgram(quadProg);

    const quadTexLoc = gl.getUniformLocation(quadProg, 'u_texColor');
    const quadTexDepthLoc = gl.getUniformLocation(quadProg, 'u_texDepth');

    gl.activeTexture(gl.TEXTURE1);
    const quadTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, quadTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, screen.render.width, screen.render.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.uniform1i(quadTexLoc, 1);

    gl.activeTexture(gl.TEXTURE2);
    const depthTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, depthTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, screen.render.width, screen.render.height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
    gl.uniform1i(quadTexDepthLoc, 2);

    const quadFrameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, quadFrameBuffer);
    gl.viewport(0, 0, screen.render.width, screen.render.height);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, quadTex, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTex, 0);

    let _resize = false;

    const spritePositions: number[][] = [];
    const spriteSpeed: number[] = [];

    for (let i = 0; i < numSpriteInstances; i++) {
        spritePositions[i] = [20 - 2 * Math.random() * 20, 200 - 2 * Math.random() * 200];
        spriteSpeed[i] = 5 * Math.random();
    }

    function update() {
        const delta = timeTracker();

        _resize = screen.needsResize;

        const view = inv(camera.view(delta));
        const viewProjection = mult(projection, view);

        sprite.update(delta);

        for (let i = 0; i < numSpriteInstances; i++) {
            const m = scale(viewProjection, sprite.spriteSize.x, sprite.spriteSize.y, 1);

            // spritePositions[i][0] += (1/40 - Math.random()/20);
            spritePositions[i][1] = (spritePositions[i][1] + Math.random() * spriteSpeed[i]) % 500;

            translate(m, spritePositions[i][0], 0, spritePositions[i][1], m);

            spriteModelTransform.set(m, i * 4 * 4);
        }

        spriteTextureTransform.set(sprite.transform);
    }

    function render() {
        if (!gl) throw 'Canvas context lost';

        // 1st pass draw sprite on quad
        gl.bindFramebuffer(gl.FRAMEBUFFER, quadFrameBuffer);
        gl.viewport(0, 0, screen.render.width, screen.render.width);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(spriteProg);

        gl.bindBuffer(gl.ARRAY_BUFFER, spriteModelTransformBuf);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, spriteModelTransform);

        gl.uniformMatrix4fv(spriteTexTransformLoc, false, spriteTextureTransform);

        gl.drawElementsInstanced(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0, numSpriteInstances);

        // 2nd pass draw quad on screen
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        gl.viewport(screen.viewPort.x, screen.viewPort.y, screen.viewPort.width, screen.viewPort.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(quadProg);

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
