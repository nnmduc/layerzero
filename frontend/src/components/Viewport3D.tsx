import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DiagnosticCard, ObjectTelemetry } from '../types';

interface Viewport3DProps {
  objects: ObjectTelemetry[];
  activePlateObjectIds: string[];
  selectedObjectId: string | null;
  selectedCard: DiagnosticCard | null;
  viewMode: 'support' | 'surface' | 'xray';
  flattenMm: number;
  onSelectObject: (oid: string) => void;
}

export const Viewport3D: React.FC<Viewport3DProps> = ({
  objects,
  activePlateObjectIds,
  selectedObjectId,
  selectedCard,
  viewMode,
  flattenMm,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshGroupRef = useRef<THREE.Group | null>(null);
  const cutPlaneRef = useRef<THREE.Mesh | null>(null);
  const objectBoundsMapRef = useRef<Record<string, { center: THREE.Vector3; size: THREE.Vector3 }>>({});
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 145, 210));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 18, 0));
  const isAnimatingRef = useRef<boolean>(false);

  // Initialize Three.js Scene & Bambu Studio Slicer Build Plate (Transparent from underneath!)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth || 800;
    const h = container.clientHeight || 600;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(35, w / h, 1, 2500);
    camera.position.set(0, 155, 225);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    // Allow full 360-degree polar orbit so user can look directly from underneath the build plate (like Bambu Studio)
    controls.minPolarAngle = 0.02;
    controls.maxPolarAngle = Math.PI - 0.02;
    controls.target.set(0, 15, 0);
    controlsRef.current = controls;

    // 1. Slicer Headlamp (Camera-attached directional light + ambient + bottom up-light)
    // Just like Bambu Studio / PrusaSlicer / OrcaSlicer, a headlamp on the camera guarantees
    // crisp surface shading whether looking from above, the side, or underneath the bed!
    scene.add(new THREE.HemisphereLight(0xffffff, 0x686875, 0.58));

    const headLight = new THREE.DirectionalLight(0xffffff, 0.72);
    headLight.position.set(18, 35, 45);
    camera.add(headLight);

    const headFill = new THREE.DirectionalLight(0xdce8ff, 0.28);
    headFill.position.set(-35, -20, 20);
    camera.add(headFill);
    scene.add(camera);

    const topSunLight = new THREE.DirectionalLight(0xffffff, 0.35);
    topSunLight.position.set(90, 220, 110);
    scene.add(topSunLight);

    const bottomInspectLight = new THREE.DirectionalLight(0x90b4ff, 0.45);
    bottomInspectLight.position.set(0, -180, 40);
    scene.add(bottomInspectLight);

    // 2. Bambu Studio Style Single-Sided Build Plate (`THREE.FrontSide`)
    // Visible as a dark PEI plate when looking from above (Y > 0), and AUTOMATICALLY
    // invisible (back-face culled) when the camera orbits below Z=0 (Y < 0) so you can
    // clearly inspect the first-layer footprint, supports, and flattened ball joints from underneath!
    const platePlaneGeo = new THREE.PlaneGeometry(256, 256);
    platePlaneGeo.rotateX(-Math.PI / 2); // Normal points strictly +Y (upward)
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x242429,
      roughness: 0.82,
      metalness: 0.18,
      side: THREE.FrontSide, // Culls automatically when camera looks from below!
      transparent: true,
      opacity: 0.92,
    });
    const plateMesh = new THREE.Mesh(platePlaneGeo, plateMat);
    plateMesh.position.y = -0.04;
    scene.add(plateMesh);

    // Subtle build plate border frame & grid (always visible from both above and below for spatial reference)
    const grid = new THREE.GridHelper(256, 16, 0x0071e3, 0x45454d);
    grid.position.y = 0.01;
    const gridMat = grid.material as THREE.Material;
    gridMat.transparent = true;
    gridMat.opacity = 0.55;
    scene.add(grid);

    const meshGroup = new THREE.Group();
    scene.add(meshGroup);
    meshGroupRef.current = meshGroup;

    // Interactive Flatten Cut Plane (Amber Laser Plane)
    const cutPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(46, 46),
      new THREE.MeshBasicMaterial({
        color: 0xff9f0a,
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    cutPlane.rotation.x = -Math.PI / 2;
    cutPlane.visible = false;
    scene.add(cutPlane);
    cutPlaneRef.current = cutPlane;

    // Stop camera auto-lerp immediately as soon as the user grabs the viewport to orbit/pan
    const stopAutoCamera = () => {
      isAnimatingRef.current = false;
    };
    renderer.domElement.addEventListener('pointerdown', stopAutoCamera);
    renderer.domElement.addEventListener('wheel', stopAutoCamera, { passive: true });

    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      if (isAnimatingRef.current) {
        camera.position.lerp(targetCamPosRef.current, 0.1);
        controls.target.lerp(targetLookAtRef.current, 0.1);
        if (camera.position.distanceTo(targetCamPosRef.current) < 0.6) {
          isAnimatingRef.current = false;
        }
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', stopAutoCamera);
      renderer.domElement.removeEventListener('wheel', stopAutoCamera);
      renderer.dispose();
    };
  }, []);

  // Build 100% Solid Indexed BufferGeometries with exact Slicer Shading & Build Plate Coordinates
  useEffect(() => {
    const group = meshGroupRef.current;
    if (!group) return;

    while (group.children.length > 0) {
      const child = group.children[0] as THREE.Mesh;
      if (child.geometry) child.geometry.dispose();
      group.remove(child);
    }
    objectBoundsMapRef.current = {};

    const filteredByPlate =
      activePlateObjectIds.length > 0
        ? objects.filter((o) => activePlateObjectIds.includes(o.id))
        : objects;
    const visibleObjs = filteredByPlate.length > 0 ? filteredByPlate : objects;

    const count = visibleObjs.length;
    const cols = Math.max(1, Math.ceil(Math.sqrt(count)));
    const spacing = 58;

    const hasRealWorldCoords = visibleObjs.some(
      (o) => Math.abs(o.world_pos[0]) > 1 || Math.abs(o.world_pos[1]) > 1
    );

    let plateMinX = Infinity,
      plateMaxX = -Infinity,
      plateMinY = Infinity,
      plateMaxY = -Infinity;
    visibleObjs.forEach((o) => {
      const wx = o.world_pos[0];
      const wy = o.world_pos[1];
      if (wx < plateMinX) plateMinX = wx;
      if (wx > plateMaxX) plateMaxX = wx;
      if (wy < plateMinY) plateMinY = wy;
      if (wy > plateMaxY) plateMaxY = wy;
    });
    const plateCenterX = Number.isFinite(plateMinX) ? (plateMinX + plateMaxX) * 0.5 : 128;
    const plateCenterY = Number.isFinite(plateMinY) ? (plateMinY + plateMaxY) * 0.5 : 128;

    visibleObjs.forEach((obj, idx) => {
      const preview = obj.mesh_preview;
      if (!preview || !preview.vertices || !preview.indices || preview.vertices.length === 0) return;

      const rawVerts = preview.vertices;
      const rawIndices = preview.indices;
      const vZones = preview.vertex_zones;
      const vCount = vZones.length;

      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity,
        minZ = Infinity,
        maxZ = -Infinity;

      for (let i = 0; i < vCount; i++) {
        const x = rawVerts[i * 3];
        const y = rawVerts[i * 3 + 1];
        const z = rawVerts[i * 3 + 2];
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        if (z < minZ) minZ = z;
        if (z > maxZ) maxZ = z;
      }

      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;

      let offsetX = 0;
      let offsetZ = 0;
      if (hasRealWorldCoords) {
        offsetX = obj.world_pos[0] - plateCenterX;
        offsetZ = obj.world_pos[1] - plateCenterY;
      } else {
        const row = Math.floor(idx / cols);
        const col = idx % cols;
        offsetX = (col - (cols - 1) / 2) * spacing;
        offsetZ = (row - (Math.ceil(count / cols) - 1) / 2) * spacing;
      }

      const isSelected = selectedObjectId === obj.id;
      const positions = new Float32Array(vCount * 3);
      const colors = new Float32Array(vCount * 3);

      // Parse filament hex palette (e.g. ['#FFFFFF', '#C12E1F', '#000000']) into shaded RGB tuples
      const rawPalette = preview.filament_colours || [];
      const vExtruders = preview.vertex_extruders;
      const hasMultiColor =
        rawPalette.length > 1 ||
        (rawPalette.length === 1 &&
          rawPalette[0].toUpperCase() !== '#FFFFFF' &&
          rawPalette[0].toUpperCase() !== '#F5F5F7');

      const parsedPalette: [number, number, number][] = rawPalette.map((hexStr) => {
        const clean = hexStr.replace('#', '').trim();
        if (clean.length >= 6) {
          const rHex = parseInt(clean.slice(0, 2), 16) / 255;
          const gHex = parseInt(clean.slice(2, 4), 16) / 255;
          const bHex = parseInt(clean.slice(4, 6), 16) / 255;
          // Clamp extreme 0.0 / 1.0 slightly so 3D specular/diffuse lighting shows crisp surface contours on pure black or pure white
          return [
            Math.min(0.92, Math.max(0.11, rHex)),
            Math.min(0.92, Math.max(0.11, gHex)),
            Math.min(0.94, Math.max(0.12, bHex)),
          ];
        }
        return isSelected ? [0.84, 0.87, 0.93] : [0.75, 0.77, 0.81];
      });

      for (let i = 0; i < vCount; i++) {
        const vx = rawVerts[i * 3] - cx + offsetX;
        const vy = rawVerts[i * 3 + 1] - cy + offsetZ;
        const vz = rawVerts[i * 3 + 2] - minZ;

        // Right-handed transform from Z-up (X right, Y back, Z up) to Three.js Y-up (X right, Y up, Z front):
        // (vx, vy, vz) -> (vx, vz, -vy) preserves positive determinant (+1) so triangle winding stays outward!
        positions[i * 3] = vx;
        positions[i * 3 + 1] = vz;
        positions[i * 3 + 2] = -vy;

        const flag = vZones[i];
        // Base Albedo: use actual AMS filament painted color if available, otherwise Slicer Matte Albedo
        let r = isSelected ? 0.84 : 0.75;
        let g = isSelected ? 0.87 : 0.77;
        let b = isSelected ? 0.93 : 0.81;

        if (hasMultiColor && vExtruders && parsedPalette.length > 0) {
          const slotIdx = Math.max(0, Math.min(parsedPalette.length - 1, (vExtruders[i] || 1) - 1));
          r = parsedPalette[slotIdx][0];
          g = parsedPalette[slotIdx][1];
          b = parsedPalette[slotIdx][2];
        }

        if (vz <= 0.24) {
          // Highlight actual Layer 1 contact footprint at Z <= 0.22mm in Emerald Green (just like Bambu Studio bottom contact indicator!)
          r = 0.16;
          g = 0.82;
          b = 0.32;
        } else if (viewMode === 'support') {
          if (flag === 1 || flag === 5) {
            // Support Enforcer / Reinforced Base Cradle (#0071E3)
            r = 0.05;
            g = 0.48;
            b = 0.92;
          } else if (flag === 2) {
            // Support Blocker (#FF3B30)
            r = 0.95;
            g = 0.24;
            b = 0.2;
          }
        } else if (viewMode === 'surface') {
          if (flag === 3) {
            // Flat Horizontal Top -> Ironing (#30B0C7)
            r = 0.18;
            g = 0.72;
            b = 0.82;
          } else if (flag === 4) {
            // Domed Top -> Adaptive Layer Height (#5856D6)
            r = 0.42;
            g = 0.4;
            b = 0.92;
          }
        }

        colors[i * 3] = r;
        colors[i * 3 + 1] = g;
        colors[i * 3 + 2] = b;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geo.setIndex(rawIndices);
      geo.computeVertexNormals();

      // Use flatShading: true — standard in Bambu Studio / PrusaSlicer / OrcaSlicer so every facet,
      // overhang crease, screw thread, and bottom contact pad is razor-sharp without blurry smoothing artifacts!
      const mat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        flatShading: true,
        roughness: 0.48,
        metalness: 0.08,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(geo, mat);
      group.add(mesh);

      // Subtle Brim outline ring on Z=0
      const rad = Math.max(maxX - minX, maxY - minY) * 0.48;
      const brimGeo = new THREE.RingGeometry(Math.max(2, rad * 0.82), rad + 4.5, 48);
      const brimMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0x0071e3 : 0x28cd41,
        transparent: true,
        opacity: isSelected ? 0.42 : 0.22,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const brimMesh = new THREE.Mesh(brimGeo, brimMat);
      brimMesh.rotation.x = -Math.PI / 2;
      brimMesh.position.set(offsetX, 0.04, -offsetZ);
      group.add(brimMesh);

      const heightZ = maxZ - minZ;
      objectBoundsMapRef.current[obj.id] = {
        center: new THREE.Vector3(offsetX, heightZ * 0.45, -offsetZ),
        size: new THREE.Vector3(maxX - minX, heightZ, maxY - minY),
      };
    });
  }, [objects, activePlateObjectIds, selectedObjectId, viewMode]);

  // Smooth Camera Fly-To when model loads, user clicks a Diagnostic Card, or switches View Mode
  useEffect(() => {
    const cutPlane = cutPlaneRef.current;
    const availIds = Object.keys(objectBoundsMapRef.current);
    const targetId =
      selectedObjectId && objectBoundsMapRef.current[selectedObjectId]
        ? selectedObjectId
        : availIds[0] || null;

    if (!targetId || !objectBoundsMapRef.current[targetId]) {
      if (cutPlane) cutPlane.visible = false;
      return;
    }

    const bounds = objectBoundsMapRef.current[targetId];
    const maxDim = Math.max(bounds.size.x, bounds.size.y, bounds.size.z, 28);
    const dist = maxDim * 1.85;

    isAnimatingRef.current = true;
    if (viewMode === 'xray') {
      // Look directly from UNDERNEATH the build plate upward at Z=0 (just like Bambu Studio bottom inspection!)
      targetCamPosRef.current.set(bounds.center.x, -dist * 0.75, bounds.center.z + dist * 0.55);
      targetLookAtRef.current.set(bounds.center.x, 2.0, bounds.center.z);
    } else if (
      selectedCard?.action_type === 'ADAPTIVE_LAYER_DOME' ||
      selectedCard?.action_type === 'IRONING_FLAT_TOP'
    ) {
      targetCamPosRef.current.set(
        bounds.center.x + dist * 0.45,
        bounds.size.y + 32,
        bounds.center.z + dist * 0.82
      );
      targetLookAtRef.current.set(bounds.center.x, bounds.size.y * 0.72, bounds.center.z);
    } else if (
      selectedCard?.action_type === 'FLATTEN_BOTTOM' ||
      selectedCard?.action_type === 'REINFORCE_SUPPORTS'
    ) {
      // Low-angle / slightly under-bed inspection angle so user clearly sees the bottom ball-joint & support cradle
      targetCamPosRef.current.set(
        bounds.center.x + dist * 0.4,
        -12,
        bounds.center.z + dist * 0.92
      );
      targetLookAtRef.current.set(bounds.center.x, 6.0, bounds.center.z);
    } else {
      targetCamPosRef.current.set(
        bounds.center.x + dist * 0.42,
        bounds.center.y + 24,
        bounds.center.z + dist
      );
      targetLookAtRef.current.set(bounds.center.x, bounds.center.y * 0.65, bounds.center.z);
    }

    if (cutPlane) {
      if (selectedCard?.action_type === 'FLATTEN_BOTTOM' && flattenMm > 0) {
        cutPlane.visible = true;
        cutPlane.position.set(bounds.center.x, flattenMm * 1.0, bounds.center.z);
      } else {
        cutPlane.visible = false;
      }
    }
  }, [objects, activePlateObjectIds, selectedObjectId, selectedCard, viewMode, flattenMm]);

  return <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
};
