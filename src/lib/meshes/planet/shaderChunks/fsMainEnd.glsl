// fragment shader end of main
// get the HSL of the original color, we only need L though.
vec3 originalHSL = RGBtoHSL(gl_FragColor.rgb);

// earth-like
vec3 color = vec3(0.0);
float speed = uTime * uSpeed;

vec3 st = vPosition.xyz;
// st += st * abs(sin(uTime*0.1)*3.0);

// self-rotation
st = rotate(st, uAxis, speed);

vec3 q = vec3(0.);
q.x = fbm( st + 0.00*speed);
q.y = fbm( st + vec3(5.2,1.3,7.8));
q.z = fbm( st + vec3(4.9,1.7,6.3));

vec3 r = vec3(0.);
r.x = fbm( st + 8.0*q + vec3(1.7,9.2,4.5)+ 0.15*speed);
r.y = fbm( st + 8.0*q + vec3(8.3,2.8,3.7)+ 0.126*speed);
r.z = fbm( st + 8.0*q + vec3(8.3,2.8,6.2)+ 0.13*speed);

vec3 s = vec3(0.);
s.x = fbm( st + 4.0*r + vec3(1.7,9.2,4.5)+ 0.15*speed);
s.y = fbm( st + 4.0*r + vec3(8.3,2.8,3.7)+ 0.126*speed);
s.z = fbm( st + 4.0*r + vec3(8.3,2.8,6.2)+ 0.13*speed);

float f = fbm(st+2.0*s);

color = mix(vec3(0.604,0.141,0.988),
            vec3(0.149,0.933,0.173),
            clamp((f*f)*4.0,0.0,1.0));

color = mix(color,
            vec3(0.373,0.224,0.886),
            clamp(length(q),0.0,1.0));

color = mix(color,
            vec3(0,0.455,1),
            clamp(length(r.x),0.0,1.0));

vec3 customRGB = mix(color, f*color, 0.6);

// transform custom color from RGB to HSL
vec3 customHSL = RGBtoHSL(customRGB);
// use the HS channel of custom color and the L channel of the original color (as the shadow)
vec3 finalHSL = vec3(customHSL.xy, originalHSL.z);
gl_FragColor = vec4(HSLtoRGB(finalHSL), 1.0);