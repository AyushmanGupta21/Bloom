'use client'

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface LiquidGlassProps {
  width?: number;
  height?: number;
  borderRadius?: number;
  thickness?: number;
  bezel?: number;
  ior?: number;
  blur?: number;
  specular?: number;
  tint?: number;
  shadow?: number;
  backgroundUrl?: string;
  interactive?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;
varying vec2 vUv;

uniform vec2 uResolution;
uniform vec2 uGlassCenter;
uniform vec2 uGlassSize;
uniform float uRadius;
uniform float uBezel;
uniform float uThickness;
uniform float uIOR;
uniform float uBlur;
uniform float uSpecular;
uniform float uTint;
uniform float uShadow;
uniform sampler2D uBgTex;
uniform float uBgAspect;
uniform int uHasTexture;

float sdRoundedRect(vec2 p, vec2 halfSize, float r) {
  vec2 q = abs(p) - halfSize + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

float surfaceHeight(float t) {
  float s = 1.0 - t;
  return pow(1.0 - s * s * s * s, 0.25);
}

vec3 sampleBg(vec2 screenUV) {
  if (uHasTexture == 0) {
    // Default dynamic dark gradient background if no texture provided
    return mix(vec3(0.04, 0.04, 0.05), vec3(0.12, 0.12, 0.16), screenUV.y);
  }
  float screenAspect = uResolution.x / uResolution.y;
  vec2 uv = screenUV;
  if (uBgAspect > screenAspect) {
    float s = screenAspect / uBgAspect;
    uv.x = uv.x * s + (1.0 - s) * 0.5;
  } else {
    float s = uBgAspect / screenAspect;
    uv.y = uv.y * s + (1.0 - s) * 0.5;
  }
  uv.y = 1.0 - uv.y;
  return texture2D(uBgTex, uv).rgb;
}

vec3 sampleBgBlurred(vec2 uv, float radius) {
  if (radius < 0.5) return sampleBg(uv);
  vec3 sum = vec3(0.0);
  vec2 px = 1.0 / uResolution;
  vec2 offsets[16];
  offsets[0]  = vec2(-0.94201, -0.39906);
  offsets[1]  = vec2( 0.94558, -0.76890);
  offsets[2]  = vec2(-0.09418, -0.92938);
  offsets[3]  = vec2( 0.34495,  0.29387);
  offsets[4]  = vec2(-0.91588, -0.45771);
  offsets[5]  = vec2(-0.81544,  0.48568);
  offsets[6]  = vec2(-0.38277, -0.56071);
  offsets[7]  = vec2(-0.12675,  0.84686);
  offsets[8]  = vec2( 0.89642,  0.41254);
  offsets[9]  = vec2( 0.18150, -0.30020);
  offsets[10] = vec2(-0.01445, -0.16001);
  offsets[11] = vec2( 0.59614,  0.71118);
  offsets[12] = vec2( 0.49742, -0.47280);
  offsets[13] = vec2( 0.80685,  0.04588);
  offsets[14] = vec2(-0.32490, -0.03965);
  offsets[15] = vec2(-0.60975,  0.06566);
  for (int i = 0; i < 16; i++) {
    sum += sampleBg(uv + offsets[i] * radius * px);
  }
  return sum / 16.0;
}

void main() {
  vec2 screenPx = vec2(vUv.x, 1.0 - vUv.y) * uResolution;
  vec2 p = screenPx - uGlassCenter;
  vec2 halfSize = uGlassSize * 0.5;

  float sd = sdRoundedRect(p, halfSize, uRadius);

  if (sd > 0.0) {
    float shadowFalloff = exp(-sd * sd / 800.0);
    float shadowAlpha = uShadow * shadowFalloff * 0.6;
    gl_FragColor = vec4(0.0, 0.0, 0.0, shadowAlpha);
    return;
  }

  float distFromEdge = -sd;
  float bezel = min(uBezel, min(uRadius, min(halfSize.x, halfSize.y)) - 1.0);
  float t = clamp(distFromEdge / max(bezel, 1.0), 0.0, 1.0);

  float h = surfaceHeight(t);
  float dt = 0.001;
  float h2 = surfaceHeight(min(t + dt, 1.0));
  float dh = (h2 - h) / dt;

  float slopeAngle = atan(dh * (uThickness / max(bezel, 1.0)));
  float sinR = clamp(sin(slopeAngle) / uIOR, -1.0, 1.0);
  float thetaR = asin(sinR);
  float displacement = h * uThickness * (tan(slopeAngle) - tan(thetaR));

  vec2 grad;
  float eps = 0.5;
  grad.x = sdRoundedRect(p + vec2(eps, 0.0), halfSize, uRadius) - sd;
  grad.y = sdRoundedRect(p + vec2(0.0, eps), halfSize, uRadius) - sd;
  grad = normalize(grad);

  vec2 offset = -grad * displacement / uResolution;
  vec2 screenUV = screenPx / uResolution;
  vec2 refractedUV = screenUV + offset;

  vec3 color = sampleBgBlurred(refractedUV, uBlur);

  vec2 lightDir = normalize(vec2(0.5, -0.7));
  float rimDot = abs(dot(grad, lightDir));
  float rimFalloff = 1.0 - smoothstep(0.0, bezel * 0.4, distFromEdge);
  float specHighlight = pow(rimDot * rimFalloff, 1.5);
  color += vec3(specHighlight * uSpecular);

  float innerShadow = 1.0 - smoothstep(0.0, bezel * 0.6, distFromEdge);
  color *= mix(1.0, 0.7, innerShadow * 0.3);

  float innerRim = smoothstep(0.0, 2.0, distFromEdge) * (1.0 - smoothstep(2.0, 5.0, distFromEdge));
  color += vec3(innerRim * 0.15 * uSpecular);

  color = mix(color, vec3(1.0), uTint);

  float alpha = smoothstep(0.0, 1.5, distFromEdge);
  gl_FragColor = vec4(color, alpha);
}
`;

export default function LiquidGlass({
  width = 320,
  height = 200,
  borderRadius = 60,
  thickness = 50,
  bezel = 60,
  ior = 3.0,
  blur = 1.5,
  specular = 0.55,
  tint = 0.08,
  shadow = 0.5,
  backgroundUrl,
  interactive = true,
  className = '',
  children,
}: LiquidGlassProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth || width, container.clientHeight || height);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const currentWidth = container.clientWidth || width;
    const currentHeight = container.clientHeight || height;
    const center = new THREE.Vector2(currentWidth / 2, currentHeight / 2);
    const size = new THREE.Vector2(width, height);

    const uniforms = {
      uResolution: { value: new THREE.Vector2(currentWidth, currentHeight) },
      uGlassCenter: { value: center },
      uGlassSize: { value: size },
      uRadius: { value: borderRadius },
      uBezel: { value: bezel },
      uThickness: { value: thickness },
      uIOR: { value: ior },
      uBlur: { value: blur },
      uSpecular: { value: specular },
      uTint: { value: tint },
      uShadow: { value: shadow },
      uBgTex: { value: null as THREE.Texture | null },
      uBgAspect: { value: 1.5 },
      uHasTexture: { value: backgroundUrl ? 1 : 0 },
    };

    if (backgroundUrl) {
      new THREE.TextureLoader().load(backgroundUrl, (tex) => {
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        uniforms.uBgTex.value = tex;
        if (tex.image) {
          uniforms.uBgAspect.value = tex.image.width / tex.image.height;
        }
      });
    }

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthTest: false,
    });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    let animationFrameId: number;
    const render = () => {
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    const handlePointerMove = (e: PointerEvent) => {
      if (!interactive || !container) return;
      const rect = container.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        uniforms.uGlassCenter.value.set(e.clientX - rect.left, e.clientY - rect.top);
      }
    };

    if (interactive) {
      window.addEventListener('pointermove', handlePointerMove);
    }

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || width;
      const h = container.clientHeight || height;
      renderer.setSize(w, h);
      uniforms.uResolution.value.set(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (interactive) window.removeEventListener('pointermove', handlePointerMove);
      renderer.dispose();
      material.dispose();
      mesh.geometry.dispose();
    };
  }, [width, height, borderRadius, thickness, bezel, ior, blur, specular, tint, shadow, backgroundUrl, interactive]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />
      <div className="relative z-20 pointer-events-auto">{children}</div>
    </div>
  );
}
