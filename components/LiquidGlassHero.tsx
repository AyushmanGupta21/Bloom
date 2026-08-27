'use client'

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

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
    vec3 c1 = vec3(0.04, 0.05, 0.08);
    vec3 c2 = vec3(0.12, 0.14, 0.22);
    vec3 c3 = vec3(0.25, 0.22, 0.40);
    float g = clamp(screenUV.y * 1.2 - screenUV.x * 0.3, 0.0, 1.0);
    return mix(mix(c1, c2, g), c3, pow(screenUV.x * screenUV.y, 1.5) * 0.8);
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
  vec3 col = texture2D(uBgTex, uv).rgb;
  
  // High-fidelity vibrant color grading: boost saturation and brightness
  col = pow(col, vec3(0.92)) * 1.08;
  return col;
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

  // Background outside the glass lens (with crisp subtle drop shadow)
  if (sd > 0.0) {
    vec3 bg = sampleBg(screenPx / uResolution);
    float shadowFalloff = exp(-sd * sd / 900.0);
    float shadowFactor = 1.0 - uShadow * shadowFalloff * 0.4;
    gl_FragColor = vec4(bg * shadowFactor, 1.0);
    return;
  }

  float distFromEdge = -sd;
  float bezel = min(uBezel, min(uRadius, min(halfSize.x, halfSize.y)) - 1.0);
  float t = clamp(distFromEdge / max(bezel, 1.0), 0.0, 1.0);

  // Meniscus curvature height & derivative slope
  float h = surfaceHeight(t);
  float dt = 0.001;
  float h2 = surfaceHeight(min(t + dt, 1.0));
  float dh = (h2 - h) / dt;

  // Snell refraction displacement
  float slopeAngle = atan(dh * (uThickness / max(bezel, 1.0)));
  float sinR = clamp(sin(slopeAngle) / uIOR, -1.0, 1.0);
  float thetaR = asin(sinR);
  float displacement = h * uThickness * (tan(slopeAngle) - tan(thetaR));

  // Normal gradient from rounded rect SDF
  vec2 grad;
  float eps = 0.5;
  grad.x = sdRoundedRect(p + vec2(eps, 0.0), halfSize, uRadius) - sd;
  grad.y = sdRoundedRect(p + vec2(0.0, eps), halfSize, uRadius) - sd;
  grad = normalize(grad);

  vec2 offset = -grad * displacement / uResolution;
  vec2 screenUV = screenPx / uResolution;
  vec2 refractedUV = screenUV + offset;

  // Refracted bright background with optical smoothing
  vec3 color = sampleBgBlurred(refractedUV, uBlur);

  // Directional specular rim highlight (vibrant glistening reflection)
  vec2 lightDir = normalize(vec2(0.55, -0.65));
  float rimDot = abs(dot(grad, lightDir));
  float rimFalloff = 1.0 - smoothstep(0.0, bezel * 0.45, distFromEdge);
  float specHighlight = pow(rimDot * rimFalloff, 1.6);
  color += vec3(specHighlight * uSpecular);

  // Inner bevel vignette & edge glow
  float innerShadow = 1.0 - smoothstep(0.0, bezel * 0.65, distFromEdge);
  color *= mix(1.0, 0.75, innerShadow * 0.25);

  float innerRim = smoothstep(0.0, 2.5, distFromEdge) * (1.0 - smoothstep(2.5, 6.0, distFromEdge));
  color += vec3(innerRim * 0.25 * uSpecular);

  // Glass Tint - subtle brightening
  color = mix(color, vec3(1.0), uTint);

  gl_FragColor = vec4(color, 1.0);
}
`;

interface LiquidGlassHeroProps {
  cardRef: React.RefObject<HTMLDivElement | null>;
  videoSrc?: string;
}

export default function LiquidGlassHero({ cardRef, videoSrc }: LiquidGlassHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: false,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      uResolution: { value: new THREE.Vector2(w, h) },
      uGlassCenter: { value: new THREE.Vector2(w * 0.75, h * 0.6) },
      uGlassSize: { value: new THREE.Vector2(460, 320) },
      uRadius: { value: 42.0 },
      uBezel: { value: 55.0 },
      uThickness: { value: 75.0 },
      uIOR: { value: 2.8 },
      uBlur: { value: 1.3 },
      uSpecular: { value: 0.8 },
      uTint: { value: 0.05 },
      uShadow: { value: 0.45 },
      uBgTex: { value: null as THREE.Texture | null },
      uBgAspect: { value: 16 / 9 },
      uHasTexture: { value: 0 },
    };

    // Load High-Performance Live Video Texture with sRGB color space
    let videoTex: THREE.VideoTexture | null = null;
    if (videoSrc) {
      const video = document.createElement('video');
      video.src = videoSrc;
      video.crossOrigin = 'anonymous';
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
      video.play().catch(() => {});
      videoRef.current = video;

      videoTex = new THREE.VideoTexture(video);
      videoTex.colorSpace = THREE.SRGBColorSpace;
      videoTex.generateMipmaps = false;
      videoTex.minFilter = THREE.LinearFilter;
      videoTex.magFilter = THREE.LinearFilter;
      uniforms.uBgTex.value = videoTex;
      uniforms.uHasTexture.value = 1;

      video.addEventListener('loadedmetadata', () => {
        if (video.videoWidth && video.videoHeight) {
          uniforms.uBgAspect.value = video.videoWidth / video.videoHeight;
        }
      });
    }

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      depthTest: false,
    });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    let targetCenterX = w * 0.75;
    let targetCenterY = h * 0.6;
    let currentCenterX = w * 0.75;
    let currentCenterY = h * 0.6;

    let animationFrameId: number;
    const render = () => {
      // Sync with card bounding box on screen
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        targetCenterX = rect.left + rect.width / 2;
        targetCenterY = rect.top + rect.height / 2;
        uniforms.uGlassSize.value.set(rect.width, rect.height);
      }

      currentCenterX += (targetCenterX - currentCenterX) * 0.15;
      currentCenterY += (targetCenterY - currentCenterY) * 0.15;
      uniforms.uGlassCenter.value.set(currentCenterX, currentCenterY);

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    const handleResize = () => {
      const nw = window.innerWidth;
      const nh = window.innerHeight;
      renderer.setSize(nw, nh);
      uniforms.uResolution.value.set(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
      }
      renderer.dispose();
      material.dispose();
      mesh.geometry.dispose();
      if (videoTex) videoTex.dispose();
    };
  }, [cardRef, videoSrc]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
    />
  );
}
