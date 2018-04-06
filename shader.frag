uniform vec2 res;
uniform float initState;
uniform float initialSpawnRate;
uniform float frame;
uniform sampler2D bufferTexture;

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
    vec4 bgColor = vec4(0.00, 0.05, 0.05, 1.0);
    float rcolor1 = 0.5 + (0.3 - gl_FragCoord.y / res.y * 0.3);
    float rcolor2 = 0.5 + (0.3 - gl_FragCoord.x / res.x * 0.3);
    vec4 aliveColor = vec4(1.0, rcolor1, rcolor2, 1.0);

    if (initState == 1.0) {
        bool cond = rand(vec2(frame, gl_FragCoord.x * gl_FragCoord.y)) > initialSpawnRate;

        if (cond) {
            gl_FragColor = aliveColor;
        } else {
            gl_FragColor = bgColor;
        }

    } else {
        vec4 p = texture2D(bufferTexture, vec2(gl_FragCoord.x + 0.0, gl_FragCoord.y + 0.0) / res);
        vec4 p1 = texture2D(bufferTexture, vec2(gl_FragCoord.x + 1.0, gl_FragCoord.y + 0.0) / res);
        vec4 p2 = texture2D(bufferTexture, vec2(gl_FragCoord.x - 1.0, gl_FragCoord.y + 0.0) / res);
        vec4 p3 = texture2D(bufferTexture, vec2(gl_FragCoord.x + 0.0, gl_FragCoord.y + 1.0) / res);
        vec4 p4 = texture2D(bufferTexture, vec2(gl_FragCoord.x + 0.0, gl_FragCoord.y - 1.0) / res);
        vec4 p5 = texture2D(bufferTexture, vec2(gl_FragCoord.x - 1.0, gl_FragCoord.y - 1.0) / res);
        vec4 p6 = texture2D(bufferTexture, vec2(gl_FragCoord.x + 1.0, gl_FragCoord.y - 1.0) / res);
        vec4 p7 = texture2D(bufferTexture, vec2(gl_FragCoord.x + 1.0, gl_FragCoord.y + 1.0) / res);
        vec4 p8 = texture2D(bufferTexture, vec2(gl_FragCoord.x - 1.0, gl_FragCoord.y + 1.0) / res);

        int nAliveCells = 0;
        bool willBeAlive = false;
        bool isAlive = p.x > bgColor.x;

        if (p1.x > bgColor.x) { nAliveCells++; }
        if (p2.x > bgColor.x) { nAliveCells++; }
        if (p3.x > bgColor.x) { nAliveCells++; }
        if (p4.x > bgColor.x) { nAliveCells++; }
        if (p5.x > bgColor.x) { nAliveCells++; }
        if (p6.x > bgColor.x) { nAliveCells++; }
        if (p7.x > bgColor.x) { nAliveCells++; }
        if (p8.x > bgColor.x) { nAliveCells++; }

        if (isAlive && nAliveCells < 2) {
            willBeAlive = false;
        } else if (isAlive && (nAliveCells == 2 || nAliveCells == 3)) {
            willBeAlive = true;
        } else if (nAliveCells > 3) {
            willBeAlive = false;
        } else if (!isAlive && nAliveCells == 3) {
            willBeAlive = true;
        }

        if (willBeAlive) {
            gl_FragColor = aliveColor;
        } else {
            gl_FragColor = bgColor;
        }
    }
 }
