"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface NeuralOrbCanvasProps {
  size?: number;
  className?: string;
  glowColor?: string;
}

export function NeuralOrbCanvas({
  size = 48,
  className = "",
  glowColor = "#ff3b30",
}: NeuralOrbCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let animId: number;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    const canvasSize = Math.max(32, size);
    renderer.setSize(canvasSize, canvasSize);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);

    // Iluminação de estúdio
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(new THREE.Color(glowColor), 2.0);
    dirLight2.position.set(-5, -3, 3);
    scene.add(dirLight2);

    // Geometria de Cristal Facetado
    const geometry = new THREE.IcosahedronGeometry(1.2, 0);

    // Material de Vidro Refrativo
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.92,
      opacity: 1,
      transparent: true,
      roughness: 0.08,
      ior: 1.5,
      thickness: 1.8,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      attenuationColor: new THREE.Color(glowColor),
      attenuationDistance: 1.5,
    });

    const mesh = new THREE.Mesh(geometry, glassMaterial);
    scene.add(mesh);

    // Wireframe sutil interno para profundidade dimensional
    const wireGeo = new THREE.IcosahedronGeometry(0.85, 0);
    const wireMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(glowColor),
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const innerWire = new THREE.Mesh(wireGeo, wireMat);
    scene.add(innerWire);

    let targetRotX = 0;
    let targetRotY = 0;
    let isHovered = false;

    const handleMouseEnter = () => {
      isHovered = true;
    };
    const handleMouseLeave = () => {
      isHovered = false;
    };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotX = y * 1.5;
      targetRotY = x * 1.5;
    };

    mount.addEventListener("mouseenter", handleMouseEnter);
    mount.addEventListener("mouseleave", handleMouseLeave);
    mount.addEventListener("mousemove", handleMouseMove);

    let lastTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (isHovered) {
        mesh.rotation.x += (targetRotX - mesh.rotation.x) * 0.1;
        mesh.rotation.y += (targetRotY - mesh.rotation.y) * 0.1;
        innerWire.rotation.x = -mesh.rotation.x * 0.8;
        innerWire.rotation.y = -mesh.rotation.y * 0.8;
      } else {
        mesh.rotation.x += 0.8 * delta;
        mesh.rotation.y += 1.2 * delta;
        innerWire.rotation.x -= 0.6 * delta;
        innerWire.rotation.y -= 0.9 * delta;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      mount.removeEventListener("mouseenter", handleMouseEnter);
      mount.removeEventListener("mouseleave", handleMouseLeave);
      mount.removeEventListener("mousemove", handleMouseMove);
      if (renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      glassMaterial.dispose();
      wireGeo.dispose();
      wireMat.dispose();
    };
  }, [size, glowColor]);

  return (
    <div
      ref={mountRef}
      style={{ width: size, height: size }}
      className={`relative shrink-0 flex items-center justify-center cursor-pointer select-none ${className}`}
      title="Motor Neural Three.js"
    />
  );
}
