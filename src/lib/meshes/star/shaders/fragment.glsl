// uniforms from js
uniform float uTime;
uniform float uSpeed;
uniform vec3 uColor;
uniform float uDiffRotationCA;
uniform float uDiffRotationCB;
uniform float uDiffRotationCC;

// varyings from vertex shader
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

// pseudo 2d random
float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

// pseudo 3d random
float random3d(vec3 pos) {
    return fract(sin(dot(pos, vec3(64.25375463, 23.27536534, 86.29678483))) * 59482.7542);
}

//	<https://www.shadertoy.com/view/4dS3Wd>
//	By Morgan McGuire @morgan3d, http://graphicscodex.com
//
float hash(float n) { return fract(sin(n) * 1e4); }
float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }

float noise(float x) {
	float i = floor(x);
	float f = fract(x);
	float u = f * f * (3.0 - 2.0 * f);
	return mix(hash(i), hash(i + 1.0), u);
}

float noise(vec2 x) {
	vec2 i = floor(x);
	vec2 f = fract(x);

	// Four corners in 2D of a tile
	float a = hash(i);
	float b = hash(i + vec2(1.0, 0.0));
	float c = hash(i + vec2(0.0, 1.0));
	float d = hash(i + vec2(1.0, 1.0));

	// Simple 2D lerp using smoothstep envelope between the values.
	// return vec3(mix(mix(a, b, smoothstep(0.0, 1.0, f.x)),
	//			mix(c, d, smoothstep(0.0, 1.0, f.x)),
	//			smoothstep(0.0, 1.0, f.y)));

	// Same code, with the clamps in smoothstep and common subexpressions
	// optimized away.
	vec2 u = f * f * (3.0 - 2.0 * f);
	return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// This one has non-ideal tiling properties that I'm still tuning
float noise(vec3 x) {
	const vec3 step = vec3(110, 241, 171);

	vec3 i = floor(x);
	vec3 f = fract(x);
 
	// For performance, compute the base input to a 1D hash from the integer part of the argument and the 
	// incremental change to the 1D based on the 3D -> 1D wrapping
    float n = dot(i, step);

	vec3 u = f * f * (3.0 - 2.0 * f);
	return mix(mix(mix( hash(n + dot(step, vec3(0, 0, 0))), hash(n + dot(step, vec3(1, 0, 0))), u.x),
                   mix( hash(n + dot(step, vec3(0, 1, 0))), hash(n + dot(step, vec3(1, 1, 0))), u.x), u.y),
               mix(mix( hash(n + dot(step, vec3(0, 0, 1))), hash(n + dot(step, vec3(1, 0, 1))), u.x),
                   mix( hash(n + dot(step, vec3(0, 1, 1))), hash(n + dot(step, vec3(1, 1, 1))), u.x), u.y), u.z);
}

#define NUM_OCTAVES 5

float fbm(float x) {
	float v = 0.0;
	float a = 0.5;
	float shift = float(100);
	for (int i = 0; i < NUM_OCTAVES; ++i) {
		v += a * noise(x);
		x = x * 2.0 + shift;
		a *= 0.5;
	}
	return v;
}


float fbm(vec2 x) {
	float v = 0.0;
	float a = 0.5;
	vec2 shift = vec2(100);
	// Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
	for (int i = 0; i < NUM_OCTAVES; ++i) {
		v += a * noise(x);
		x = rot * x * 2.0 + shift;
		a *= 0.5;
	}
	return v;
}


float fbm(vec3 x) {
	float v = 0.0;
	float a = 0.5;
	vec3 shift = vec3(100);
	for (int i = 0; i < NUM_OCTAVES; ++i) {
		v += a * noise(x);
		x = x * 2.0 + shift;
		a *= 0.5;
	}
	return v;
}

vec3 rotate(vec3 point, vec3 axis, float theta) {
    // Normalize the axis
    axis = normalize(axis);
    
    // Calculate the sine and cosine of the rotation angle
    float s = sin(theta);
    float c = cos(theta);
    
    // Compute the components of the skew-symmetric matrix K
    mat3 K = mat3(
        0.0, -axis.z, axis.y,
        axis.z, 0.0, -axis.x,
        -axis.y, axis.x, 0.0
    );
    
     // Calculate the rotation matrix R
    mat3 R = mat3(
        1.0, 0.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 0.0, 1.0
    ) + s * K + (1.0 - c) * K * K;
    
    // Apply the rotation to the point
    return R * point;
}

// Differential rotation
// https://en.wikipedia.org/wiki/Solar_rotation
float diffRotationSpeed(vec3 point, float A, float B, float C) {
	vec3 equator = vec3(0.0, 1.0, 0.0);
	float cosFactor = dot(point, equator) / (length(point) * length(equator)); // use cosine to replace sine
	return radians(A) + radians(B) * (1.0 - pow(cosFactor, 2.0)) + radians(C) * pow((1.0 - pow(cosFactor, 2.0)), 2.0);
}

// sun-like
void main() {
    vec3 color = vec3(0.0);
    vec3 st = vPosition.xyz;

    float speed = uTime * uSpeed * diffRotationSpeed(st, uDiffRotationCA, uDiffRotationCB, uDiffRotationCC);

	// self-rotation
	st = rotate(st, vec3(0.,1.,0.), speed);

	vec3 q = vec3(0.);
	q.x = fbm( st + 0.00*speed);
	q.y = fbm( st + vec3(5.2,1.3,7.8));
	q.z = fbm( st + vec3(4.9,1.7,6.3));

	vec3 r = vec3(0.);
	r.x = fbm( st + 8.0*q + vec3(1.7,9.2,4.5)+ 0.15*speed);
	r.y = fbm( st + 8.0*q + vec3(8.3,2.8,3.7)+ 0.126*speed);
	r.z = fbm( st + 8.0*q + vec3(8.3,2.8,6.2)+ 0.13*speed);

	vec3 s = vec3(0.);
	s.x = fbm( st + 8.0*r + vec3(1.7,9.2,4.5)+ 0.15*speed);
	s.y = fbm( st + 8.0*r + vec3(8.3,2.8,3.7)+ 0.126*speed);
	s.z = fbm( st + 8.0*r + vec3(8.3,2.8,6.2)+ 0.13*speed);

	float f = fbm(st+8.0*s);
	vec3 lighter = mix(uColor, vec3(1.), 0.5);
	vec3 darker = mix(uColor, vec3(0.), 0.5);

	color = mix(darker,
				uColor,
				clamp((f*f)*4.0,0.0,1.0));

	color = mix(lighter,
				uColor,
				clamp(length(q),0.0,1.0));

	color = mix(uColor,
				darker,
				clamp(length(r.x),0.0,1.0));

	vec3 customRGB = mix(color, f*color, 0.6);

    // gl_FragColor = vec4(uColor, 1.0);
	gl_FragColor = vec4(customRGB, 1.0);
}