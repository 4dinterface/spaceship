#define TAU 6.28318530718
#define MAX_ITER 15

precision highp float;

//Varying
varying vec3 vPosition;              
varying vec3 vNormal;
varying vec2 vUV;

// Uniforms
uniform mat4 world;
                  

// Refs
uniform vec3 cameraPosition;
uniform float time;

//специфические параметры
uniform vec3 backgroundColor;
uniform vec3 color;
uniform float speed;
uniform float brightness;
            
void main(void) {                    
    //vec2 uv = vUV * vec2(1.,1000.);    
    //vec2 uv = vUv * resolution;                
    //vec2 uv = +gl_FragCoord.xy*0.002;    
    
    vec2 uv=vPosition.xy* vec2(0.01, 0.01);            
    
    vec2 p = mod(uv * TAU, TAU) - 250.0;
    vec2 i = vec2(p);
    
    float c = 1.0;
    float inten = 0.005;
    
    for ( int n = 0; n < MAX_ITER; n++ )  {
        float t = time * speed * (1.0 - (3.5 / float(n + 1)));
        i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
        c += 1.0 / length(vec2(p.x / (sin(i.x + t) / inten), p.y / (cos(i.y + t) / inten)));
    }
    
    c /= float( MAX_ITER  );
    c = 1.17 - pow( c, brightness );
    
    vec3 rgb = vec3( pow( abs( c ), 8.0 ) );
    
    //float a=pow(1./(1.-rgb.r),4.);
    float a=0.4;
    
    gl_FragColor = vec4( rgb * color + backgroundColor, a );                                        
}