"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface FluidGlassCanvasProps {
  className?: string;
  intensity?: number;
}

export function FluidGlassCanvas({ className = "", intensity = 1 }: FluidGlassCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let animationFrameId: number;

    let width = mount.clientWidth;
    let height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    mount.appendChild(renderer.domElement);

    // Iluminação para Estúdio Claro (Reflexos e Refrações Nítidas)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(12, 16, 14);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe2e8f0, 1.2);
    fillLight.position.set(-14, -10, 8);
    scene.add(fillLight);

    // Material de Vidro Líquido Cristalino (Transmissão de Luz Limpa)
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.98,
      opacity: 1,
      transparent: true,
      roughness: 0.02,
      ior: 1.45,
      thickness: 2.2,
      specularIntensity: 1.2,
      specularColor: new THREE.Color(0xffffff),
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      attenuationColor: new THREE.Color(0xffffff),
      attenuationDistance: 8.0,
    });

    const droplets: {
      mesh: THREE.Mesh;
      baseX: number;
      baseY: number;
      baseZ: number;
      speedX: number;
      speedY: number;
      scaleSpeed: number;
      seed: number;
    }[] = [];

    const dropletGeometries = [
      new THREE.SphereGeometry(1, 48, 48),
      new THREE.IcosahedronGeometry(1.2, 8),
      new THREE.SphereGeometry(1.4, 48, 48),
    ];

    const dropletConfigs = [
      { x: -5.8, y: 3.2, z: 2.0, scale: 1.7, sX: 0.6, sY: 0.7 },
      { x: 6.4, y: -2.5, z: 3.0, scale: 2.2, sX: 0.5, sY: 0.6 },
      { x: -4.2, y: -3.8, z: 1.2, scale: 1.3, sX: 0.7, sY: 0.8 },
      { x: 5.2, y: 4.0, z: 0.8, scale: 1.5, sX: 0.6, sY: 0.5 },
      { x: 1.8, y: 4.6, z: -0.5, scale: 1.1, sX: 0.8, sY: 0.6 },
      { x: -2.0, y: -4.4, z: 2.2, scale: 1.2, sX: 0.5, sY: 0.9 },
      { x: 7.0, y: 1.5, z: 1.5, scale: 1.4, sX: 0.7, sY: 0.6 },
    ];

    dropletConfigs.forEach((cfg, i) => {
      const geo = dropletGeometries[i % dropletGeometries.length];
      const mesh = new THREE.Mesh(geo, glassMaterial);

      mesh.position.set(cfg.x, cfg.y, cfg.z);
      mesh.scale.set(cfg.scale, cfg.scale * 1.06, cfg.scale * 0.96);
      mesh.rotation.z = Math.random() * Math.PI;
      scene.add(mesh);

      droplets.push({
        mesh,
        baseX: cfg.x,
        baseY: cfg.y,
        baseZ: cfg.z,
        speedX: cfg.sX,
        speedY: cfg.sY,
        scaleSpeed: 0.8 + Math.random() * 0.5,
        seed: Math.random() * 100,
      });
    });

    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetMouseX = x * 2.0 * intensity;
      targetMouseY = y * 2.0 * intensity;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      droplets.forEach((d, idx) => {
        const t = time * 0.6 + d.seed;
        d.mesh.position.x = d.baseX + Math.sin(t * d.speedX) * 0.5 + currentMouseX * (0.8 + idx * 0.15);
        d.mesh.position.y = d.baseY + Math.cos(t * d.speedY) * 0.5 + currentMouseY * (0.8 + idx * 0.15);
        d.mesh.position.z = d.baseZ + Math.sin(t * 0.4) * 0.25;

        d.mesh.rotation.x = t * 0.15;
        d.mesh.rotation.y = t * 0.2;

        const scalePulse = 1 + Math.sin(t * d.scaleSpeed) * 0.05;
        d.mesh.scale.set(
          d.mesh.scale.x * 0.98 + (dropletConfigs[idx].scale * scalePulse) * 0.02,
          d.mesh.scale.y * 0.98 + (dropletConfigs[idx].scale * (2 - scalePulse) * 1.06) * 0.02,
          d.mesh.scale.z * 0.98 + (dropletConfigs[idx].scale * scalePulse * 0.96) * 0.02
        );
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mount) return;
      width = mount.clientWidth;
      height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      glassMaterial.dispose();
      dropletGeometries.forEach((g) => g.dispose());
      renderer.dispose();
    };
  }, [intensity]);

  return (
    <div
      ref={mountRef}
      className={`absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden ${className}`}
    />
  );
}
