import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { rooms } from "../data/rooms.js";

export function createHouseScene(canvas, markerContainer, onRoomSelect) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#eeece4");
  scene.fog = new THREE.Fog("#eeece4", 25, 48);

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(29, 23, 32);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.065;
  controls.minDistance = 12;
  controls.maxDistance = 48;
  controls.maxPolarAngle = Math.PI * 0.47;
  controls.minPolarAngle = 0.28;
  controls.rotateSpeed = 0.75;
  controls.zoomSpeed = 0.8;
  controls.panSpeed = 0.75;
  controls.screenSpacePanning = true;
  controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
  controls.mouseButtons.MIDDLE = THREE.MOUSE.DOLLY;
  controls.mouseButtons.RIGHT = THREE.MOUSE.PAN;
  controls.target.set(0, 0, 0);

  const lighting = {
    hemisphere: new THREE.HemisphereLight(0xfff6e8, 0x8c927d, 2.05),
    pointLights: [],
    glowMaterials: [],
    fairyGlowPositions: new Map(),
    fairyHaloMaterial: null,
  };
  scene.add(lighting.hemisphere);
  const sun = new THREE.DirectionalLight(0xffe9c7, 3.2);
  sun.position.set(-6, 14, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -15;
  sun.shadow.camera.right = 15;
  sun.shadow.camera.top = 15;
  sun.shadow.camera.bottom = -15;
  sun.shadow.bias = -0.0004;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xe6eddf, 1.35);
  fill.position.set(9, 8, -8);
  scene.add(fill);

  const floorMaterial = new THREE.MeshStandardMaterial({ color: "#bd9570", roughness: 0.88 });
  const wallMaterial = new THREE.MeshStandardMaterial({ color: "#e7c46f", roughness: 0.94 });
  const trimMaterial = new THREE.MeshStandardMaterial({ color: "#fff0cf", roughness: 0.85 });
  const sageMaterial = new THREE.MeshStandardMaterial({ color: "#87937a", roughness: 0.9 });
  const deepSageMaterial = new THREE.MeshStandardMaterial({ color: "#596d57", roughness: 0.9 });
  const woodMaterial = new THREE.MeshStandardMaterial({ color: "#9b704e", roughness: 0.78 });
  const lightWoodMaterial = new THREE.MeshStandardMaterial({ color: "#c49b72", roughness: 0.84 });
  const fabricMaterial = new THREE.MeshStandardMaterial({ color: "#d6c4a5", roughness: 1 });
  const creamMaterial = new THREE.MeshStandardMaterial({ color: "#eee5d5", roughness: 1 });
  const terracottaMaterial = new THREE.MeshStandardMaterial({ color: "#b97d5b", roughness: 0.88 });
  const darkMaterial = new THREE.MeshStandardMaterial({ color: "#454b40", roughness: 0.65 });
  const rugDetailMaterial = new THREE.MeshStandardMaterial({ color: "#d5bb94", roughness: 1 });
  const glassMaterial = new THREE.MeshStandardMaterial({
    color: "#c8d6ca",
    roughness: 0.22,
    metalness: 0.04,
    transparent: true,
    opacity: 0.43,
  });
  const windowGlassMaterial = new THREE.MeshStandardMaterial({
    color: "#d6e0dc",
    emissive: "#ffd39a",
    emissiveIntensity: 0.38,
    roughness: 0.2,
    metalness: 0.04,
    transparent: true,
    opacity: 0.58,
  });
  lighting.glowMaterials.push({ material: windowGlassMaterial, baseIntensity: windowGlassMaterial.emissiveIntensity });
  const greenMaterials = ["#6d8262", "#849674", "#a0a984", "#536e5b"].map(
    (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.92 }),
  );
  const itemLibrary = {
    books: ["#876c51", "#b88460", "#596d57", "#d2bd9c", "#78816b"].map(
      (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.95 }),
    ),
    sofaPillows: [
      creamMaterial,
      fabricMaterial,
      new THREE.MeshStandardMaterial({ color: "#c98666", roughness: 1 }),
    ],
    throws: ["#c78668", "#d3c5a9", "#89977c", "#c39a73", "#b4c0ad"].map(
      (color) => new THREE.MeshStandardMaterial({ color, roughness: 1, side: THREE.DoubleSide }),
    ),
    ensuiteTile: new THREE.MeshStandardMaterial({ color: "#f1e7d2", roughness: 0.9 }),
    ensuiteGrout: new THREE.MeshStandardMaterial({ color: "#d2c4a8", roughness: 1 }),
    porcelain: new THREE.MeshStandardMaterial({ color: "#fffaf0", roughness: 0.28 }),
  };

  const home = new THREE.Group();
  home.scale.set(1.14, 1, 1.22);
  scene.add(home);
  const glowCanvas = document.createElement("canvas");
  glowCanvas.width = 32;
  glowCanvas.height = 32;
  const glowContext = glowCanvas.getContext("2d");
  if (!glowContext) throw new Error("Unable to create fairy-light glow texture.");
  const radialGlow = glowContext.createRadialGradient(16, 16, 1, 16, 16, 16);
  radialGlow.addColorStop(0, "rgba(255, 255, 255, 0.8)");
  radialGlow.addColorStop(0.28, "rgba(255, 255, 255, 0.48)");
  radialGlow.addColorStop(1, "rgba(255, 255, 255, 0)");
  glowContext.fillStyle = radialGlow;
  glowContext.fillRect(0, 0, 32, 32);
  lighting.fairyHaloMaterial = new THREE.MeshBasicMaterial({
    map: new THREE.CanvasTexture(glowCanvas),
    color: "#ffd18a",
    transparent: true,
    opacity: 0.26,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const fairyHaloGeometry = new THREE.PlaneGeometry(0.56, 0.56);

  function addFairyGlow(parent, x, y, z, orientation = "front") {
    let roomGlows = lighting.fairyGlowPositions.get(parent);
    if (!roomGlows) {
      roomGlows = { front: [], side: [] };
      lighting.fairyGlowPositions.set(parent, roomGlows);
    }
    const glowPosition = orientation === "front"
      ? { x, y, z: z + (z >= 0 ? -0.025 : 0.025), rotation: 0 }
      : { x: x + (x >= 0 ? -0.025 : 0.025), y, z, rotation: Math.PI / 2 };
    roomGlows[orientation].push(glowPosition);
  }

  function addTimedPointLight(parent, x, y, z, options = {}) {
    const light = new THREE.PointLight(options.color ?? "#ffd29a", 0, options.distance ?? 4.5, 2);
    light.position.set(x, y, z);
    parent.add(light);
    lighting.pointLights.push({
      light,
      levels: options.levels ?? { daylight: 0.2, "golden-hour": 0.55, dusk: 1, night: 1.2 },
      isWindow: options.isWindow ?? false,
    });
    return light;
  }

  function registerGlowMaterial(material) {
    lighting.glowMaterials.push({ material, baseIntensity: material.emissiveIntensity });
    return material;
  }

  function box(parent, x, y, z, width, height, depth, material, cast = true) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    mesh.position.set(x, y + height / 2, z);
    mesh.castShadow = cast;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function roundedBox(parent, x, y, z, width, height, depth, radius, material, cast = true) {
    const mesh = new THREE.Mesh(
      new RoundedBoxGeometry(width, height, depth, 4, radius),
      material,
    );
    mesh.position.set(x, y + height / 2, z);
    mesh.castShadow = cast;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function cylinder(parent, x, y, z, radiusTop, radiusBottom, height, material, sides = 12) {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radiusTop, radiusBottom, height, sides),
      material,
    );
    mesh.position.set(x, y + height / 2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function sphere(parent, x, y, z, radius, material, scale = [1, 1, 1]) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 9, 7), material);
    mesh.position.set(x, y, z);
    mesh.scale.set(...scale);
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function groupFor(roomId) {
    const group = new THREE.Group();
    group.userData.roomId = roomId;
    home.add(group);
    return group;
  }

  function addPlant(parent, x, z, size = 1, potColor = terracottaMaterial, bushy = true) {
    cylinder(parent, x, 0, z, 0.19 * size, 0.24 * size, 0.31 * size, potColor, 10);
    cylinder(parent, x, 0.3 * size, z, 0.13 * size, 0.14 * size, 0.07 * size, darkMaterial, 10);
    const stem = cylinder(parent, x, 0.36 * size, z, 0.035 * size, 0.06 * size, 0.68 * size, woodMaterial, 7);
    stem.rotation.z = -0.08;
    const leafCount = bushy ? 9 : 6;
    for (let i = 0; i < leafCount; i += 1) {
      const angle = (i / leafCount) * Math.PI * 2;
      const height = (0.62 + (i % 3) * 0.17) * size;
      const distance = (0.17 + (i % 2) * 0.05) * size;
      const leaf = sphere(
        parent,
        x + Math.cos(angle) * distance,
        height,
        z + Math.sin(angle) * distance,
        0.19 * size,
        greenMaterials[i % greenMaterials.length],
        [0.65, 1.25, 0.5],
      );
      leaf.rotation.z = Math.cos(angle) * -0.42;
      leaf.rotation.x = Math.sin(angle) * 0.4;
    }
    sphere(parent, x, 0.83 * size, z, 0.21 * size, greenMaterials[1], [0.75, 1.3, 0.75]);
  }

  function addRug(parent, x, z, width, depth, material, angle = 0) {
    const rug = new THREE.Group();
    rug.position.set(x, 0, z);
    rug.rotation.y = angle;
    parent.add(rug);
    box(rug, 0, 0.145, 0, width, 0.035, depth, material, false);
    for (const side of [-1, 1]) {
      box(rug, side * (width / 2 - 0.045), 0.18, 0, 0.025, 0.01, depth - 0.12, rugDetailMaterial, false);
      box(rug, 0, 0.18, side * (depth / 2 - 0.045), width - 0.12, 0.01, 0.025, rugDetailMaterial, false);
    }
  }

  function addSoftRug(parent, x, z, width, depth, material) {
    const shape = new THREE.Shape();
    shape.moveTo(-width * 0.38, -depth * 0.5);
    shape.bezierCurveTo(-width * 0.12, -depth * 0.56, width * 0.16, -depth * 0.46, width * 0.39, -depth * 0.5);
    shape.bezierCurveTo(width * 0.53, -depth * 0.4, width * 0.47, -depth * 0.18, width * 0.52, 0);
    shape.bezierCurveTo(width * 0.48, depth * 0.2, width * 0.57, depth * 0.4, width * 0.36, depth * 0.5);
    shape.bezierCurveTo(width * 0.12, depth * 0.46, -width * 0.12, depth * 0.56, -width * 0.38, depth * 0.5);
    shape.bezierCurveTo(-width * 0.53, depth * 0.38, -width * 0.46, depth * 0.16, -width * 0.52, 0);
    shape.bezierCurveTo(-width * 0.47, -depth * 0.2, -width * 0.55, -depth * 0.39, -width * 0.38, -depth * 0.5);
    const rug = new THREE.Mesh(new THREE.ShapeGeometry(shape, 24), material);
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(x, 0.145, z);
    rug.receiveShadow = true;
    parent.add(rug);
    return rug;
  }

  function addChair(parent, x, z, angle = 0, material = lightWoodMaterial, seatMaterial = creamMaterial) {
    const chair = new THREE.Group();
    chair.position.set(x, 0, z);
    chair.rotation.y = angle;
    parent.add(chair);
    box(chair, 0, 0.48, 0, 0.66, 0.15, 0.62, seatMaterial);
    box(chair, 0, 0.85, -0.26, 0.66, 0.65, 0.12, material);
    for (const dx of [-0.23, 0.23]) {
      for (const dz of [-0.21, 0.21]) {
        box(chair, dx, 0, dz, 0.075, 0.48, 0.075, material);
      }
    }
  }

  function addNappySofa(parent, x, z, width, color = sageMaterial, seatColor = creamMaterial, rotation = 0) {
    const sofa = new THREE.Group();
    sofa.position.set(x, 0, z);
    sofa.rotation.y = rotation;
    parent.add(sofa);

    const pillowColors = itemLibrary.sofaPillows;
    roundedBox(sofa, 0, 0.18, 0, width, 0.55, 0.95, 0.19, color);
    roundedBox(sofa, 0, 0.65, 0.31, width - 0.12, 0.76, 0.28, 0.14, color);
    roundedBox(sofa, -width / 2 + 0.13, 0.42, 0, 0.31, 0.68, 1.0, 0.14, color);
    roundedBox(sofa, width / 2 - 0.13, 0.42, 0, 0.31, 0.68, 1.0, 0.14, color);
    const cushionCount = Math.max(2, Math.floor(width / 1.05));
    for (let index = 0; index < cushionCount; index += 1) {
      const cushionX = -width / 2 + (index + 0.5) * (width / cushionCount);
      roundedBox(sofa, cushionX, 0.46, -0.1, width / cushionCount - 0.07, 0.16, 0.7, 0.075, seatColor);
      const pillow = roundedBox(sofa, cushionX, 0.86, 0.1, 0.52, 0.48, 0.2, 0.14, pillowColors[index % pillowColors.length]);
      pillow.rotation.z = index % 2 === 0 ? -0.08 : 0.08;
    }
    roundedBox(sofa, 0, 0.03, 0, width - 0.32, 0.14, 0.72, 0.06, woodMaterial);
    const throwColors = itemLibrary.throws;
    addDrapedBlanket(
      sofa,
      -width * 0.25,
      0,
      Math.min(width * 0.38, 0.78),
      throwColors[Math.abs(Math.round(x * 7 + z * 3)) % throwColors.length].color,
    );
  }

  function addLShapedSofa(
    parent,
    x,
    z,
    color = sageMaterial,
    seatColor = creamMaterial,
    rotation = -Math.PI / 2,
    chaiseSide = 1,
  ) {
    const sofa = new THREE.Group();
    sofa.position.set(x, 0, z);
    sofa.rotation.y = rotation;
    parent.add(sofa);

    const chaiseX = 0.58 * chaiseSide;
    const chaiseZ = -0.62;
    roundedBox(sofa, -0.05, 0.18, 0.02, 2.15, 0.56, 1.0, 0.2, color);
    roundedBox(sofa, chaiseX, 0.2, chaiseZ, 0.98, 0.58, 1.12, 0.2, color);
    roundedBox(sofa, -0.05, 0.63, 0.32, 2.03, 0.74, 0.3, 0.16, color);
    roundedBox(sofa, -0.94, 0.42, 0.02, 0.3, 0.66, 0.98, 0.14, color);
    roundedBox(sofa, 0.86, 0.42, 0.02, 0.3, 0.66, 0.98, 0.14, color);
    roundedBox(sofa, -0.05, 0.47, -0.12, 1.94, 0.17, 0.68, 0.09, seatColor);
    roundedBox(sofa, chaiseX, 0.49, chaiseZ, 0.8, 0.18, 1.0, 0.1, seatColor);
    roundedBox(sofa, chaiseX, 0.48, -1.12, 0.98, 0.58, 0.22, 0.1, color);

    for (const [pillowX, pillowZ, angle] of [
      [-0.65 * chaiseSide, 0.04, -0.08],
      [-0.05, 0.04, 0.06],
      [0.54 * chaiseSide, 0.04, -0.05],
      [chaiseX, -0.56, 0.08],
    ]) {
      const pillow = roundedBox(sofa, pillowX, 0.91, pillowZ, 0.48, 0.46, 0.2, 0.14, itemLibrary.sofaPillows[1]);
      pillow.rotation.z = angle;
    }
    roundedBox(sofa, chaiseX, 0.7, -0.62, 0.48, 0.35, 0.16, 0.1, itemLibrary.sofaPillows[2]);
    addDrapedBlanket(sofa, -0.55 * chaiseSide, 0.02, 0.62, "#c78668");
  }

  function addDrapedBlanket(parent, x, z, width, color = "#c78668") {
    const material = itemLibrary.throws.find((candidate) => candidate.color.getHexString() === new THREE.Color(color).getHexString())
      ?? itemLibrary.throws[0];
    const rows = [
      { z: z + 0.14, y: 0.69 },
      { z: z - 0.02, y: 0.68 },
      { z: z - 0.2, y: 0.66 },
      { z: z - 0.38, y: 0.62 },
      { z: z - 0.49, y: 0.54 },
      { z: z - 0.54, y: 0.38 },
      { z: z - 0.55, y: 0.22 },
    ];
    const across = 8;
    const vertices = [];
    const indices = [];
    for (let row = 0; row < rows.length; row += 1) {
      for (let column = 0; column <= across; column += 1) {
        const u = column / across;
        const wave = Math.sin(u * Math.PI * 4 + row * 0.42) * 0.025;
        vertices.push(
          x + (u - 0.5) * width,
          rows[row].y + wave,
          rows[row].z + Math.sin(u * Math.PI * 2) * 0.025,
        );
      }
    }
    for (let row = 0; row < rows.length - 1; row += 1) {
      for (let column = 0; column < across; column += 1) {
        const topLeft = row * (across + 1) + column;
        const topRight = topLeft + 1;
        const bottomLeft = topLeft + across + 1;
        const bottomRight = bottomLeft + 1;
        indices.push(topLeft, bottomLeft, topRight, topRight, bottomLeft, bottomRight);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const blanket = new THREE.Mesh(geometry, material);
    blanket.castShadow = true;
    parent.add(blanket);
  }

  function addHingedDoor(parent, x, z, width = 1.16, rotation = Math.PI / 2, openAngle = -0.16) {
    const height = 2.12;
    const frameDepth = 0.2;
    const frame = new THREE.Group();
    frame.position.set(x, 0, z);
    frame.rotation.y = rotation;
    parent.add(frame);

    roundedBox(frame, -width / 2, 0, 0, 0.1, height + 0.08, frameDepth, 0.025, trimMaterial);
    roundedBox(frame, width / 2, 0, 0, 0.1, height + 0.08, frameDepth, 0.025, trimMaterial);
    roundedBox(frame, 0, height, 0, width + 0.1, 0.1, frameDepth, 0.025, trimMaterial);

    const hinge = new THREE.Group();
    hinge.position.set(-width / 2 + 0.07, 0, 0);
    frame.add(hinge);
    const leafWidth = width - 0.14;
    const leafCenter = leafWidth / 2;
    roundedBox(hinge, leafCenter, 0.06, 0, leafWidth, height - 0.1, 0.105, 0.045, woodMaterial);

    const panelMaterial = new THREE.MeshStandardMaterial({ color: "#b88a60", roughness: 0.84 });
    for (const side of [-1, 1]) {
      const face = side * 0.058;
      roundedBox(hinge, leafCenter, 1.25, face, leafWidth * 0.72, 0.55, 0.035, 0.035, panelMaterial);
      roundedBox(hinge, leafCenter, 0.48, face, leafWidth * 0.72, 0.55, 0.035, 0.035, panelMaterial);
      const knob = new THREE.Mesh(
        new THREE.SphereGeometry(0.065, 12, 10),
        new THREE.MeshStandardMaterial({ color: "#d6b36f", metalness: 0.72, roughness: 0.28 }),
      );
      knob.position.set(leafWidth - 0.2, 1.0, side * 0.1);
      hinge.add(knob);
    }

    for (const y of [0.38, 1.06, 1.76]) {
      roundedBox(hinge, 0.035, y, 0.055, 0.08, 0.13, 0.14, 0.02, darkMaterial);
    }
    hinge.rotation.y = openAngle;
    return frame;
  }

  function addBooks(parent, x, y, z, count, direction = "x") {
    for (let i = 0; i < count; i += 1) {
      const height = 0.16 + (i % 3) * 0.055;
      const width = 0.06 + (i % 2) * 0.025;
      const book = box(
        parent,
        x + (direction === "x" ? i * 0.105 : 0),
        y,
        z + (direction === "z" ? i * 0.105 : 0),
        direction === "x" ? width : 0.18,
        height,
        direction === "z" ? width : 0.18,
        itemLibrary.books[i % itemLibrary.books.length],
      );
      book.rotation.y = direction === "x" ? 0 : Math.PI / 2;
    }
  }

  function addBedsideLamp(parent, x, z) {
    cylinder(parent, x, 0, z, 0.25, 0.28, 0.045, woodMaterial, 12);
    box(parent, x, 0.05, z, 0.36, 0.48, 0.36, lightWoodMaterial);
    cylinder(parent, x, 0.53, z, 0.035, 0.04, 0.2, darkMaterial, 8);
    const shadeMaterial = registerGlowMaterial(new THREE.MeshStandardMaterial({
      color: "#fff0ca",
      emissive: "#f7bd67",
      emissiveIntensity: 0.55,
      roughness: 0.8,
    }));
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.23, 0.25, 12), shadeMaterial);
    shade.position.set(x, 0.78, z);
    parent.add(shade);
    addTimedPointLight(parent, x, 1.05, z, { distance: 3.2, levels: { daylight: 0.16, "golden-hour": 0.3, dusk: 0.48, night: 0.56 } });
  }

  function addFloorLamp(parent, x, z, shadeColor = "#f8e7c8") {
    cylinder(parent, x, 0, z, 0.22, 0.27, 0.07, darkMaterial, 12);
    cylinder(parent, x, 0.07, z, 0.035, 0.045, 1.46, darkMaterial, 8);
    const shadeMaterial = registerGlowMaterial(new THREE.MeshStandardMaterial({
      color: shadeColor,
      emissive: "#e9a951",
      emissiveIntensity: 0.45,
      roughness: 0.82,
    }));
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 0.38, 14), shadeMaterial);
    shade.position.set(x, 1.72, z);
    parent.add(shade);
    addTimedPointLight(parent, x, 1.55, z, { distance: 5, levels: { daylight: 0.28, "golden-hour": 0.6, dusk: 1.05, night: 1.25 } });
  }

  function addPendantLight(parent, x, z) {
    const pendant = new THREE.Group();
    pendant.position.set(x, 0, z);
    parent.add(pendant);
    cylinder(pendant, 0, 2.68, 0, 0.012, 0.012, 0.38, darkMaterial, 6);
    sphere(pendant, 0, 2.05, 0, 0.3, registerGlowMaterial(new THREE.MeshStandardMaterial({
      color: "#a46d3c",
      emissive: "#6f3714",
      emissiveIntensity: 0.35,
      roughness: 0.88,
    })), [1, 1.28, 1]);
    for (const [y, radius] of [[1.76, 0.2], [1.91, 0.32], [2.1, 0.3], [2.29, 0.22]]) {
      const weave = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.018, 6, 28), lightWoodMaterial);
      weave.position.set(0, y, 0);
      weave.rotation.x = Math.PI / 2;
      pendant.add(weave);
    }
    addTimedPointLight(pendant, 0, 2.0, 0, { color: "#ffc36b", distance: 4.5, levels: { daylight: 0.28, "golden-hour": 0.58, dusk: 0.9, night: 1.1 } });
  }

  function addOverheadLight(parent, x, z, strength = 2.1, distance = 7) {
    const fixture = new THREE.Group();
    fixture.position.set(x, 0, z);
    parent.add(fixture);
    cylinder(fixture, 0, 2.82, 0, 0.14, 0.17, 0.08, woodMaterial, 14);
    cylinder(fixture, 0, 2.55, 0, 0.018, 0.018, 0.22, darkMaterial, 8);
    const shadeMaterial = registerGlowMaterial(new THREE.MeshStandardMaterial({
      color: "#fff1d7",
      emissive: "#ffc66f",
      emissiveIntensity: 0.9,
      roughness: 0.82,
      side: THREE.DoubleSide,
    }));
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.48, 0.34, 18, 1, true), shadeMaterial);
    shade.position.y = 2.28;
    fixture.add(shade);
    sphere(fixture, 0, 2.1, 0, 0.11, registerGlowMaterial(new THREE.MeshStandardMaterial({
      color: "#fff5df",
      emissive: "#ffd180",
      emissiveIntensity: 2.2,
      roughness: 0.32,
    })), [1, 0.7, 1]);
    addTimedPointLight(fixture, 0, 2.05, 0, {
      color: "#ffe2b4",
      distance,
      levels: {
        daylight: strength * 0.3,
        "golden-hour": strength * 0.58,
        dusk: strength * 0.9,
        night: strength,
      },
    });
  }

  function addDeskLamp(parent, x, z) {
    const lampBaseMaterial = new THREE.MeshStandardMaterial({ color: "#82745e", metalness: 0.32, roughness: 0.55 });
    cylinder(parent, x, 0.77, z, 0.12, 0.14, 0.055, lampBaseMaterial, 14);
    cylinder(parent, x, 0.82, z, 0.024, 0.035, 0.29, lampBaseMaterial, 10);
    const shadeMaterial = registerGlowMaterial(new THREE.MeshStandardMaterial({
      color: "#fff1d4",
      emissive: "#ffc66f",
      emissiveIntensity: 0.9,
      roughness: 0.78,
    }));
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.25, 0.25, 14), shadeMaterial);
    shade.position.set(x, 1.24, z);
    parent.add(shade);
    addTimedPointLight(parent, x, 1.2, z, {
      color: "#ffd28b",
      distance: 3.8,
      levels: { daylight: 0.25, "golden-hour": 0.55, dusk: 0.95, night: 1.2 },
    });
  }

  function addBed(parent, x, z, width, depth, blanket, rotation = 0) {
    const bed = new THREE.Group();
    bed.position.set(x, 0, z);
    bed.rotation.y = rotation;
    parent.add(bed);
    box(bed, 0, 0, 0, width + 0.18, 0.34, depth + 0.16, woodMaterial);
    box(bed, 0, 0.34, 0, width, 0.28, depth, creamMaterial);
    box(bed, 0, 0.6, depth * 0.12, width, 0.2, depth * 0.72, blanket);
    box(bed, 0, 0.63, -depth * 0.34, width * 0.42, 0.16, depth * 0.24, trimMaterial);
    box(bed, -width * 0.25, 0.63, -depth * 0.34, width * 0.36, 0.16, depth * 0.24, trimMaterial);
    box(bed, 0, 0, -depth / 2 - 0.11, width + 0.2, 1.15, 0.16, woodMaterial);
    addBedsideLamp(bed, -width * 0.69, -depth / 2 + 0.14);
    addBedsideLamp(bed, width * 0.69, -depth / 2 + 0.14);
  }

  function addEnsuite(parent, startZ, endZ, doorCenterZ) {
    const tileMaterial = itemLibrary.ensuiteTile;
    const tileLineMaterial = itemLibrary.ensuiteGrout;
    const porcelainMaterial = itemLibrary.porcelain;
    const roomDepth = endZ - startZ;
    const centerZ = (startZ + endZ) / 2;
    const ensuiteStartX = -8.98;
    const partitionX = -6.52;
    const doorWidth = 0.86;
    const openingWidth = 0.96;
    const partitionThickness = 0.14;
    const wallCenterX = (ensuiteStartX + partitionX) / 2;
    const openingStart = doorCenterZ - openingWidth / 2;
    const openingEnd = doorCenterZ + openingWidth / 2;

    box(parent, (ensuiteStartX + partitionX) / 2, 0.012, centerZ,
      partitionX - ensuiteStartX, 0.035, roomDepth - 0.12, tileMaterial, false);
    const tileRows = Math.floor((roomDepth - 0.16) / 0.38);
    for (let index = 1; index < 6; index += 1) {
      const x = ensuiteStartX + index * ((partitionX - ensuiteStartX) / 6);
      box(parent, x, 0.035, centerZ, 0.012, 0.008, roomDepth - 0.18, tileLineMaterial, false);
    }
    for (let index = 1; index <= tileRows; index += 1) {
      const z = startZ + index * (roomDepth / (tileRows + 1));
      box(parent, wallCenterX, 0.035, z, partitionX - ensuiteStartX - 0.16, 0.008, 0.012, tileLineMaterial, false);
    }

    const wallHeight = 2.35;
    box(parent, partitionX, 0, (startZ + openingStart) / 2,
      partitionThickness, wallHeight, openingStart - startZ, wallMaterial);
    box(parent, partitionX, 0, (openingEnd + endZ) / 2,
      partitionThickness, wallHeight, endZ - openingEnd, wallMaterial);
    box(parent, partitionX, 2.12, doorCenterZ, partitionThickness, 0.23, openingWidth, wallMaterial);
    addHingedDoor(parent, partitionX, doorCenterZ, doorWidth, Math.PI / 2, -0.12);

    const fixtureZ = [startZ + roomDepth * 0.25, endZ - roomDepth * 0.25];
    const ensuiteLightMaterial = registerGlowMaterial(new THREE.MeshStandardMaterial({
      color: "#fff1d5",
      emissive: "#f7bd67",
      emissiveIntensity: 0.65,
      roughness: 0.7,
    }));
    cylinder(parent, -7.72, 2.12, centerZ, 0.12, 0.18, 0.12, trimMaterial, 12);
    sphere(parent, -7.72, 2.1, centerZ, 0.105, ensuiteLightMaterial, [1, 0.5, 1]);
    addTimedPointLight(parent, -7.72, 2.08, centerZ, {
      distance: 3.6,
      levels: { daylight: 0.2, "golden-hour": 0.36, dusk: 0.56, night: 0.68 },
    });
    cylinder(parent, -8.35, 0, fixtureZ[0], 0.31, 0.33, 0.11, porcelainMaterial, 16);
    cylinder(parent, -8.35, 0.11, fixtureZ[0], 0.23, 0.28, 0.27, porcelainMaterial, 16);
    box(parent, -8.35, 0.37, fixtureZ[0], 0.45, 0.1, 0.48, porcelainMaterial);

    box(parent, -7.25, 0, fixtureZ[0], 0.58, 0.42, 0.52, porcelainMaterial);
    cylinder(parent, -7.25, 0.42, fixtureZ[0], 0.27, 0.28, 0.08, porcelainMaterial, 14);

    box(parent, -8.15, 0.05, fixtureZ[1], 0.55, 0.1, 0.58, porcelainMaterial);
    box(parent, -8.15, 0.15, fixtureZ[1], 0.5, 1.2, 0.52, glassMaterial, false);
    cylinder(parent, -8.15, 1.26, fixtureZ[1], 0.08, 0.08, 0.2, darkMaterial, 8);
  }

  function addWallFairyLights(parent, x, z, span = 3.3) {
    const wirePoints = [];
    const bulbs = Math.max(8, Math.round(span * 3));
    for (let index = 0; index <= bulbs; index += 1) {
      const t = index / bulbs;
      wirePoints.push(
        new THREE.Vector3(x - span / 2 + t * span, 2.18 + Math.sin(t * Math.PI * 2) * 0.045, z),
      );
    }
    const wire = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(wirePoints), bulbs * 4, 0.012, 5, false),
      darkMaterial,
    );
    parent.add(wire);

    const bulbMaterial = registerGlowMaterial(new THREE.MeshStandardMaterial({
      color: "#ffe9a8",
      emissive: "#ffbd55",
      emissiveIntensity: 2.8,
      roughness: 0.25,
    }));
    for (let index = 0; index <= bulbs; index += 1) {
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.048, 8, 6), bulbMaterial);
      bulb.position.copy(wirePoints[index]);
      parent.add(bulb);
      addFairyGlow(parent, wirePoints[index].x, wirePoints[index].y, wirePoints[index].z);
    }
    for (const endX of [wirePoints[0].x, wirePoints.at(-1).x]) {
      for (let index = 1; index <= 4; index += 1) {
        const y = 2.18 - index * 0.36;
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.048, 8, 6), bulbMaterial);
        bulb.position.set(endX, y, z);
        parent.add(bulb);
        addFairyGlow(parent, endX, y, z);
      }
    }
    addTimedPointLight(parent, x, 2.1, z, { distance: Math.min(span + 1.5, 6), levels: { daylight: 0.12, "golden-hour": 0.28, dusk: 0.5, night: 0.62 } });
  }

  function addHallSideLights(parent, x, startZ, endZ) {
    const points = [];
    const bulbCount = Math.max(8, Math.floor(Math.abs(endZ - startZ) * 2.5));
    for (let index = 0; index <= bulbCount; index += 1) {
      const t = index / bulbCount;
      points.push(new THREE.Vector3(x, 2.2 + Math.sin(t * Math.PI * 2) * 0.04, startZ + (endZ - startZ) * t));
    }
    const wire = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), bulbCount * 4, 0.012, 5, false),
      darkMaterial,
    );
    parent.add(wire);
    const bulbMaterial = registerGlowMaterial(new THREE.MeshStandardMaterial({
      color: "#ffe9a8",
      emissive: "#ffbd55",
      emissiveIntensity: 2.8,
      roughness: 0.25,
    }));
    for (let index = 0; index <= bulbCount; index += 1) {
      if (index % 2 === 0) {
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), bulbMaterial);
        bulb.position.copy(points[index]);
        parent.add(bulb);
        addFairyGlow(parent, points[index].x, points[index].y, points[index].z, "side");
      }
    }
    for (const endpointZ of [startZ, endZ]) {
      for (let index = 1; index <= 4; index += 1) {
        const y = 2.2 - index * 0.36;
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), bulbMaterial);
        bulb.position.set(x, y, endpointZ);
        parent.add(bulb);
        addFairyGlow(parent, x, y, endpointZ, "side");
      }
    }
    addTimedPointLight(
      parent,
      x,
      2.1,
      startZ + (endZ - startZ) * 0.5,
      { distance: Math.min(Math.abs(endZ - startZ) * 0.8, 7), levels: { daylight: 0.2, "golden-hour": 0.42, dusk: 0.78, night: 1.05 } },
    );
  }

  function addWallArt(parent, x, y, z, width, height, accent = "#72806b", facing = "front") {
    const frameMaterial = new THREE.MeshStandardMaterial({ color: "#8e6549", roughness: 0.8 });
    const canvasMaterial = new THREE.MeshStandardMaterial({ color: "#f5e8cf", roughness: 1 });
    const side = facing === "front" ? 1 : -1;
    box(parent, x, y, z, width, height, 0.09, frameMaterial);
    box(parent, x, y + 0.08, z + side * 0.052, width - 0.15, height - 0.16, 0.025, canvasMaterial, false);
    const artMaterial = new THREE.MeshStandardMaterial({ color: accent, roughness: 0.95 });
    sphere(parent, x - width * 0.16, y + height * 0.56, z + side * 0.085, Math.min(width, height) * 0.2, artMaterial, [1, 1, 0.12]);
    box(parent, x + width * 0.12, y + height * 0.25, z + side * 0.085, width * 0.38, 0.06, 0.025, terracottaMaterial, false);
  }

  function addBookshelf(parent, x, z, width, depth, bookRows = 4) {
    const height = 2.25;
    const sideThickness = 0.09;
    box(parent, x - width / 2 + sideThickness / 2, 0, z, sideThickness, height, depth, woodMaterial);
    box(parent, x + width / 2 - sideThickness / 2, 0, z, sideThickness, height, depth, woodMaterial);
    box(parent, x, 0, z - depth / 2 + 0.025, width - sideThickness, height, 0.05, woodMaterial);
    for (let row = 0; row < bookRows; row += 1) {
      const shelfY = 0.32 + row * 0.48;
      box(parent, x, shelfY, z, width - 0.08, 0.07, depth, lightWoodMaterial);
      const bookCount = 6;
      const bookSpacing = (width - 0.3) / bookCount;
      for (let index = 0; index < bookCount; index += 1) {
        const bookHeight = 0.27 + ((index + row) % 3) * 0.055;
        const book = box(
          parent,
          x - (width - 0.3) / 2 + bookSpacing * (index + 0.5),
          shelfY + 0.035,
          z + 0.045,
          bookSpacing * 0.78,
          bookHeight,
          depth * 0.62,
          itemLibrary.books[(index + row) % itemLibrary.books.length],
        );
        book.rotation.z = ((index + row) % 2 === 0 ? -1 : 1) * 0.035;
      }
    }
    box(parent, x, height - 0.04, z, width + 0.08, 0.09, depth + 0.08, lightWoodMaterial);
  }

  function addWallBookShelf(parent, x, z, facing = "back") {
    const sign = facing === "back" ? -1 : 1;
    for (const y of [1.1, 1.65, 2.2]) {
      roundedBox(parent, x, y, z, 1.35, 0.08, 0.24, 0.025, lightWoodMaterial);
      addBooks(parent, x - 0.5, y + 0.04, z + sign * 0.02, 5);
    }
  }

  // A broad, open-plan cutaway with the entry facing the viewer.
  box(home, 0, -0.16, 0, 18.2, 0.3, 14.0, floorMaterial, false);
  for (let i = 0; i < 32; i += 1) {
    const seam = new THREE.Mesh(
      new THREE.BoxGeometry(18.1, 0.006, 0.012),
      new THREE.MeshStandardMaterial({ color: i % 2 ? "#ae8765" : "#c5a07a", roughness: 1 }),
    );
    seam.position.set(0, 0.001, -6.78 + i * 0.44);
    seam.receiveShadow = true;
    home.add(seam);
  }
  box(home, -6.5, 0, 7, 5.0, 3.15, 0.24, wallMaterial);
  box(home, 4.5, 0, 7, 9.0, 3.15, 0.24, wallMaterial);
  box(home, -3.0, 0, 7, 2.0, 3.15, 0.24, wallMaterial);
  box(home, 9, 0, 0, 0.24, 3.15, 14.0, wallMaterial);

  // Bedroom doors line one side of the hallway; the divider preserves a broad living-room opening.
  const roomDoorCenters = [-5.15, -1.6, 2.1, 5.0];
  const hallwayWallSegments = [];
  let hallwayWallCursor = -6.85;
  for (const center of roomDoorCenters) {
    const openingStart = center - 0.68;
    const openingEnd = center + 0.68;
    hallwayWallSegments.push([hallwayWallCursor, openingStart]);
    hallwayWallCursor = openingEnd;
  }
  hallwayWallSegments.push([hallwayWallCursor, 6.85]);
  for (const [start, end] of hallwayWallSegments) {
    box(home, -2.65, 0, (start + end) / 2, 0.15, 2.5, end - start, wallMaterial);
  }
  for (const [start, end] of [[-6.85, 1.35], [3.35, 6.85]]) {
    box(home, 1.15, 0, (start + end) / 2, 0.15, 2.5, end - start, wallMaterial);
  }
  for (const z of [4.3, 0.1, -3.3]) {
    box(home, -5.815, 0, z, 6.33, 2.35, 0.15, wallMaterial);
  }
  box(home, -5.8, 0, 6.83, 6.3, 0.15, 0.24, trimMaterial);

  // The back garden door and windows are true openings in the rear wall.
  const rearWindowCenters = [-7, -4, 2.7, 6.2];
  const rearDoorCenter = -1.0;
  const rearDoorHalfWidth = 1.42;
  const rearDoorStart = rearDoorCenter - rearDoorHalfWidth;
  const rearDoorEnd = rearDoorCenter + rearDoorHalfWidth;
  box(home, (-9 + rearDoorStart) / 2, 0, -6.98, rearDoorStart + 9, 0.82, 0.08, wallMaterial);
  box(home, (rearDoorEnd + 9) / 2, 0, -6.98, 9 - rearDoorEnd, 0.82, 0.08, wallMaterial);
  box(home, 0, 2.35, -6.98, 18.0, 0.8, 0.08, wallMaterial);
  const rearOpenings = [
    ...rearWindowCenters.map((center) => ({ center, halfWidth: 0.82, isWindow: true })),
    { center: rearDoorCenter, halfWidth: rearDoorHalfWidth, isWindow: false },
  ].sort((a, b) => a.center - b.center);
  let rearWallCursor = -9;
  for (const { center, halfWidth, isWindow } of rearOpenings) {
    const leftEdge = center - halfWidth;
    if (leftEdge > rearWallCursor) {
      box(home, (rearWallCursor + leftEdge) / 2, 0.82, -6.98, leftEdge - rearWallCursor, 1.53, 0.08, wallMaterial);
    }
    if (!isWindow) {
      rearWallCursor = center + halfWidth;
      continue;
    }
    box(home, center - 0.86, 0.78, -6.9, 0.08, 1.62, 0.2, trimMaterial);
    box(home, center + 0.86, 0.78, -6.9, 0.08, 1.62, 0.2, trimMaterial);
    box(home, center, 0.78, -6.9, 1.8, 0.08, 0.2, trimMaterial);
    box(home, center, 2.33, -6.9, 1.8, 0.08, 0.2, trimMaterial);
    box(home, center, 0.9, -7.07, 1.58, 1.36, 0.035, windowGlassMaterial, false);
    addTimedPointLight(home, center, 1.45, -6.35, {
      color: "#fff0cf",
      distance: 5.5,
      levels: { daylight: 0.75, "golden-hour": 0.68, dusk: 0.3, night: 0.06 },
      isWindow: true,
    });
    rearWallCursor = center + halfWidth;
  }
  if (rearWallCursor < 9) {
    box(home, (rearWallCursor + 9) / 2, 0.82, -6.98, 9 - rearWallCursor, 1.53, 0.08, wallMaterial);
  }
  box(home, -8.98, 0, 0, 0.08, 0.82, 14.0, wallMaterial);
  box(home, -8.98, 2.35, 0, 0.08, 0.8, 14.0, wallMaterial);
  let sideWallCursor = -7;
  for (const center of [-5.15, -1.6, 2.1, 5.0]) {
    const windowStart = center - 0.82;
    const windowEnd = center + 0.82;
    if (windowStart > sideWallCursor) {
      box(home, -8.98, 0.82, (sideWallCursor + windowStart) / 2, 0.08, 1.53, windowStart - sideWallCursor, wallMaterial);
    }
    box(home, -8.98, 0.78, center - 0.82, 0.2, 1.62, 0.08, trimMaterial);
    box(home, -8.98, 0.78, center + 0.82, 0.2, 1.62, 0.08, trimMaterial);
    box(home, -8.98, 0.78, center, 0.2, 0.08, 1.64, trimMaterial);
    box(home, -8.98, 2.32, center, 0.2, 0.08, 1.64, trimMaterial);
    box(home, -9.1, 0.9, center, 0.035, 1.36, 1.55, windowGlassMaterial, false);
    addTimedPointLight(home, -8.25, 1.45, center, {
      color: "#fff0cf",
      distance: 5.5,
      levels: { daylight: 0.75, "golden-hour": 0.68, dusk: 0.3, night: 0.06 },
      isWindow: true,
    });
    sideWallCursor = windowEnd;
  }
  if (sideWallCursor < 7) {
    box(home, -8.98, 0.82, (sideWallCursor + 7) / 2, 0.08, 1.53, 7 - sideWallCursor, wallMaterial);
  }
  // Hinged doors sit inside the actual hallway, ensuite, and front-entry openings.
  addHingedDoor(home, -1.0, 6.84, 1.82, 0, -0.5);
  const patioFrameMaterial = new THREE.MeshStandardMaterial({ color: "#755a42", roughness: 0.68 });
  const patioGlassMaterial = new THREE.MeshPhysicalMaterial({
    color: "#d9e4dd",
    roughness: 0.14,
    metalness: 0.08,
    transmission: 0.35,
    transparent: true,
    opacity: 0.36,
    thickness: 0.08,
  });
  box(home, rearDoorCenter - rearDoorHalfWidth, 0, -6.88, 0.09, 2.18, 0.2, trimMaterial);
  box(home, rearDoorCenter + rearDoorHalfWidth, 0, -6.88, 0.09, 2.18, 0.2, trimMaterial);
  box(home, rearDoorCenter, 0.02, -6.88, rearDoorHalfWidth * 2, 0.075, 0.2, patioFrameMaterial);
  box(home, rearDoorCenter, 2.08, -6.88, rearDoorHalfWidth * 2, 0.09, 0.2, patioFrameMaterial);
  for (const offset of [-0.69, 0.69]) {
    box(home, rearDoorCenter + offset, 1.08, -6.9, 0.055, 2.0, 0.08, patioFrameMaterial);
  }
  for (const offset of [-0.7, 0.7]) {
    box(home, rearDoorCenter + offset, 1.06, -6.96, 1.34, 1.94, 0.035, patioGlassMaterial, false);
  }
  box(home, rearDoorCenter + 0.05, 1.08, -6.91, 0.045, 2.0, 0.1, trimMaterial);
  box(home, rearDoorCenter - 0.34, 1.05, -6.93, 0.035, 0.42, 0.035, patioFrameMaterial, false);
  for (const [centerZ, swing] of [[-5.15, -0.2], [-1.6, 0.2], [2.1, -0.2], [5.0, 0.2]]) {
    addHingedDoor(home, -2.65, centerZ, 1.25, Math.PI / 2, swing);
  }
  box(home, -1.0, 0.015, 6.18, 1.8, 0.045, 1.08, new THREE.MeshStandardMaterial({ color: "#cdb895", roughness: 1 }), false);

  const living = groupFor("living");
  addSoftRug(living, 5.15, 3.25, 7.2, 5.8, new THREE.MeshStandardMaterial({ color: "#c8b89c", roughness: 1 }));
  for (const [x, z] of [[4.25, 2.25], [6.35, 4.25]]) {
    const canopy = new THREE.MeshStandardMaterial({ color: "#675443", metalness: 0.28, roughness: 0.62 });
    cylinder(living, x, 2.9, z, 0.14, 0.16, 0.08, canopy, 14);
    cylinder(living, x, 2.52, z, 0.018, 0.018, 0.34, darkMaterial, 8);
    const shade = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.66, 0.42, 20, 1, true),
      registerGlowMaterial(new THREE.MeshStandardMaterial({
        color: "#fff0d0",
        emissive: "#ffc269",
        emissiveIntensity: 0.9,
        roughness: 0.82,
        side: THREE.DoubleSide,
      })),
    );
    shade.position.set(x, 2.23, z);
    living.add(shade);
    sphere(living, x, 2.0, z, 0.11, registerGlowMaterial(new THREE.MeshStandardMaterial({
      color: "#fff4d9",
      emissive: "#ffd181",
      emissiveIntensity: 2.1,
      roughness: 0.35,
    })), [1, 0.72, 1]);
    addTimedPointLight(living, x, 2.05, z, {
      color: "#ffe0ad",
      distance: 9,
      levels: { daylight: 0.9, "golden-hour": 1.65, dusk: 2.5, night: 2.9 },
    });
  }
  const loungeSage = new THREE.MeshStandardMaterial({ color: "#87937a", roughness: 0.9 });
  const loungeDeepSage = new THREE.MeshStandardMaterial({ color: "#687960", roughness: 0.92 });
  addLShapedSofa(living, 4.2, 5.05, loungeSage, fabricMaterial, -Math.PI / 2, 1);
  addLShapedSofa(living, 4.2, 1.5, loungeDeepSage, fabricMaterial, -Math.PI / 2, -1);

  const coffeeTable = new THREE.Group();
  coffeeTable.position.set(6.35, 0, 3.25);
  living.add(coffeeTable);
  for (const [x, z] of [[-0.63, -0.82], [0.63, -0.82], [-0.63, 0.82], [0.63, 0.82]]) {
    cylinder(coffeeTable, x, 0, z, 0.055, 0.07, 0.38, woodMaterial, 10);
  }
  roundedBox(coffeeTable, 0, 0.38, 0, 1.7, 0.14, 2.05, 0.16, lightWoodMaterial);
  roundedBox(coffeeTable, 0.35, 0.51, -0.2, 0.38, 0.09, 0.34, 0.08, terracottaMaterial, false);
  cylinder(coffeeTable, -0.38, 0.51, 0.2, 0.12, 0.14, 0.12, creamMaterial, 12);
  sphere(coffeeTable, -0.38, 0.68, 0.2, 0.13, greenMaterials[1], [0.8, 1.2, 0.8]);

  for (const [x, z] of [[2.45, 4.35], [2.45, 2.05], [7.45, 5.5], [7.45, 1.0]]) {
    const table = new THREE.Group();
    table.position.set(x, 0, z);
    living.add(table);
    roundedBox(table, 0, 0.76, 0, 0.78, 0.12, 0.72, 0.12, lightWoodMaterial);
    for (const [legX, legZ] of [[-0.28, -0.24], [0.28, -0.24], [-0.28, 0.24], [0.28, 0.24]]) {
      cylinder(table, legX, 0, legZ, 0.035, 0.045, 0.76, woodMaterial, 8);
    }
    addDeskLamp(table, 0, 0);
  }

  box(living, 8.4, 0, 3.25, 0.48, 1.1, 2.6, woodMaterial);
  roundedBox(living, 8.08, 0.42, 3.25, 0.07, 1.15, 2.15, 0.035, darkMaterial, false);
  roundedBox(living, 8.03, 0.48, 3.25, 0.035, 0.92, 1.92, 0.025, new THREE.MeshStandardMaterial({
    color: "#292f31",
    emissive: "#172124",
    emissiveIntensity: 0.22,
    roughness: 0.25,
    metalness: 0.08,
  }), false);
  box(living, 8.02, 1.0, 3.25, 0.04, 0.06, 0.28, darkMaterial, false);
  addPlant(living, 2.15, 5.65, 1.25, terracottaMaterial);
  addPlant(living, 7.5, 5.4, 1.35, sageMaterial);
  addPlant(living, 7.85, 0.0, 1.0, terracottaMaterial, false);
  addFloorLamp(living, 2.1, 3.2);
  addWallFairyLights(living, 4.6, 6.83, 5.6);
  addWallArt(living, 4.6, 1.3, 6.83, 1.35, 1.2, "#71836b", "back");
  addWallArt(living, 6.55, 1.45, 6.83, 0.9, 1.0, "#c88664", "back");

  const kitchen = groupFor("kitchen");
  addRug(kitchen, 4.7, -3.55, 5.1, 5.0, new THREE.MeshStandardMaterial({ color: "#d8ccba", roughness: 1 }));
  addOverheadLight(kitchen, 2.6, -1.05, 1.8, 6.5);
  addOverheadLight(kitchen, 4.6, -3.55, 2.25, 8);
  addOverheadLight(kitchen, 6.9, -5.7, 2.0, 7.5);
  box(kitchen, 5.35, 0, -6.18, 6.1, 0.92, 0.86, lightWoodMaterial);
  box(kitchen, 5.35, 0.94, -6.18, 6.2, 0.13, 0.98, creamMaterial);
  for (const x of [3.15, 4.6, 6.05, 7.5]) {
    box(kitchen, x, 0.1, -5.72, 0.08, 0.64, 0.03, woodMaterial, false);
    box(kitchen, x, 0.48, -5.72, 0.08, 0.035, 0.035, darkMaterial, false);
  }
  box(kitchen, 4.0, 0.07, -6.75, 1.35, 0.06, 0.32, darkMaterial, false);
  box(kitchen, 4.0, 0.14, -6.75, 1.23, 0.05, 0.25, darkMaterial, false);
  box(kitchen, 6.8, 0.07, -6.72, 1.0, 0.06, 0.36, creamMaterial, false);
  box(kitchen, 6.8, 0.93, -6.35, 1.25, 0.025, 0.42, trimMaterial, false);
  box(kitchen, 6.8, 0.9, -6.35, 0.06, 0.035, 0.07, woodMaterial, false);
  box(kitchen, 5.0, 0, -3.85, 3.5, 0.92, 1.0, woodMaterial);
  box(kitchen, 5.0, 0.94, -3.85, 3.65, 0.14, 1.12, creamMaterial);
  for (const x of [3.7, 5.0, 6.3]) {
    cylinder(kitchen, x, 0, -3.0, 0.07, 0.075, 0.55, darkMaterial, 9);
    cylinder(kitchen, x, 0.55, -3.0, 0.32, 0.32, 0.12, terracottaMaterial, 14);
    box(kitchen, x, 0.64, -3.0, 0.48, 0.09, 0.48, creamMaterial);
  }
  box(kitchen, 2.6, 0.78, -1.05, 2.1, 0.16, 1.15, lightWoodMaterial);
  for (const [x, z] of [[1.85, -1.55], [3.35, -1.55], [1.85, -0.55], [3.35, -0.55]]) {
    box(kitchen, x, 0, z, 0.08, 0.8, 0.08, woodMaterial);
  }
  addChair(kitchen, 2.6, -2.0, 0, woodMaterial, fabricMaterial);
  addChair(kitchen, 2.6, 0, Math.PI, woodMaterial, fabricMaterial);
  addChair(kitchen, 1.35, -1.05, Math.PI / 2, woodMaterial, fabricMaterial);
  addChair(kitchen, 3.85, -1.05, -Math.PI / 2, woodMaterial, fabricMaterial);
  cylinder(kitchen, 2.6, 0.96, -1.05, 0.09, 0.09, 0.18, terracottaMaterial, 12);
  sphere(kitchen, 2.6, 1.28, -1.05, 0.14, greenMaterials[1], [0.8, 1.2, 0.8]);
  addPlant(kitchen, 8.0, -0.8, 1.3, sageMaterial);
  addPlant(kitchen, 7.75, -4.35, 1.25, terracottaMaterial, false);
  addNappySofa(kitchen, 7.55, -1.65, 2.25, deepSageMaterial, fabricMaterial);
  addFloorLamp(kitchen, 8.1, -0.2);
  addWallFairyLights(kitchen, 5.0, -6.83, 5.0);
  addWallArt(kitchen, 0.3, 1.35, -6.83, 1.05, 0.95, "#c88664");
  addWallArt(kitchen, 1.65, 1.45, -6.83, 0.82, 0.82, "#788c72");

  const study = groupFor("study");
  addSoftRug(study, -5.8, 5.55, 4.7, 2.45, new THREE.MeshStandardMaterial({ color: "#c8b395", roughness: 1 }));
  addPendantLight(study, -5.8, 5.35);
  addLShapedSofa(study, -7.4, 5.65);
  for (const shelfY of [0.82, 1.35, 1.88]) {
    box(study, -6.95, shelfY, 4.43, 2.3, 0.08, 0.34, lightWoodMaterial);
    addBooks(study, -7.92, shelfY + 0.08, 4.48, 10);
  }
  addWallFairyLights(study, -5.8, 6.83, 4.8);
  addWallArt(study, -5.8, 1.25, 6.83, 1.1, 1.0, "#71836b", "back");

  const master = groupFor("master");
  addRug(master, -4.75, 2.9, 3.2, 2.85, new THREE.MeshStandardMaterial({ color: "#c9b99f", roughness: 1 }));
  addPendantLight(master, -4.4, 1.65);
  addBed(master, -4.4, 3.1, 1.8, 1.55, sageMaterial, Math.PI);
  addWallBookShelf(master, -5.55, 0.38, "front");
  addEnsuite(master, 0.1, 4.3, 2.1);
  addWallFairyLights(master, -4.75, 4.2, 3.3);

  const kidOne = groupFor("kid-one");
  addRug(kidOne, -4.75, -2.0, 3.2, 2.2, new THREE.MeshStandardMaterial({ color: "#d7c8b3", roughness: 1 }));
  addPendantLight(kidOne, -4.8, -2.1);
  addBed(kidOne, -4.8, -0.9, 1.2, 1.3, new THREE.MeshStandardMaterial({ color: "#d9b9a9", roughness: 1 }), Math.PI);
  addWallBookShelf(kidOne, -5.55, -0.3, "front");
  addEnsuite(kidOne, -3.3, 0.1, -1.6);
  addWallFairyLights(kidOne, -4.7, 0.02, 3.1);

  const kidTwo = groupFor("kid-two");
  addRug(kidTwo, -4.75, -5.2, 3.2, 2.85, new THREE.MeshStandardMaterial({ color: "#c7d0bd", roughness: 1 }));
  addPendantLight(kidTwo, -4.8, -5.35);
  addBed(kidTwo, -4.8, -4.45, 1.2, 1.3, new THREE.MeshStandardMaterial({ color: "#abc0ad", roughness: 1 }), Math.PI);
  addWallBookShelf(kidTwo, -5.55, -3.65, "back");
  addEnsuite(kidTwo, -6.98, -3.3, -5.15);
  addWallFairyLights(kidTwo, -4.7, -3.4, 3.1);

  const hallway = groupFor("hallway");
  const hallwayRunnerMaterial = new THREE.MeshStandardMaterial({ color: "#969a98", roughness: 1 });
  addSoftRug(hallway, -1.0, 0.05, 1.72, 12.3, hallwayRunnerMaterial);
  for (const z of [5.0, 1.7, -1.7, -5.0]) {
    addOverheadLight(hallway, -0.72, z, 2.8, 8.5);
  }

  // An entry console, heirloom-style mirror, and small collected objects echo the reference.
  box(hallway, -2.18, 0, 3.65, 0.58, 0.78, 1.05, woodMaterial);
  box(hallway, -2.18, 0.8, 3.65, 0.82, 0.12, 1.2, lightWoodMaterial);
  box(hallway, -2.18, 0.28, 3.65, 0.46, 0.04, 0.82, darkMaterial);
  const mirrorRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.49, 0.045, 10, 40),
    new THREE.MeshStandardMaterial({ color: "#8b6145", roughness: 0.78 }),
  );
  mirrorRing.position.set(-2.51, 1.66, 3.65);
  mirrorRing.rotation.y = Math.PI / 2;
  hallway.add(mirrorRing);
  const mirrorGlass = new THREE.Mesh(
    new THREE.CircleGeometry(0.43, 32),
    new THREE.MeshStandardMaterial({ color: "#b9b7a6", metalness: 0.35, roughness: 0.24 }),
  );
  mirrorGlass.position.set(-2.5, 1.66, 3.65);
  mirrorGlass.rotation.y = Math.PI / 2;
  hallway.add(mirrorGlass);

  cylinder(hallway, -2.13, 0.92, 3.33, 0.16, 0.19, 0.42, terracottaMaterial, 12);
  cylinder(hallway, -2.13, 1.34, 3.33, 0.11, 0.11, 0.045, lightWoodMaterial, 12);
  for (const [x, z, angle] of [[-2.13, 3.33, -0.28], [-2.13, 3.33, 0.2], [-2.13, 3.33, 0.05]]) {
    const stem = cylinder(hallway, x, 1.35, z, 0.012, 0.018, 0.62, woodMaterial, 6);
    stem.rotation.z = angle;
    sphere(hallway, x + Math.sin(angle) * 0.2, 1.62 + Math.cos(angle) * 0.05, z, 0.075, greenMaterials[1], [0.55, 1.0, 0.35]);
    sphere(hallway, x + Math.sin(angle) * 0.34, 1.8, z, 0.065, greenMaterials[2], [0.55, 1.0, 0.35]);
  }
  const lanternFrame = new THREE.MeshStandardMaterial({ color: "#463b2c", metalness: 0.25, roughness: 0.72 });
  box(hallway, -2.21, 0.92, 4.02, 0.3, 0.3, 0.3, lanternFrame, false);
  for (const dx of [-0.13, 0.13]) {
    for (const dz of [-0.13, 0.13]) {
      box(hallway, -2.21 + dx, 0.91, 4.02 + dz, 0.025, 0.36, 0.025, lanternFrame, false);
    }
  }
  sphere(hallway, -2.21, 1.08, 4.02, 0.085, registerGlowMaterial(new THREE.MeshStandardMaterial({
    color: "#ffe2a6",
    emissive: "#eaa24b",
    emissiveIntensity: 1.5,
    roughness: 0.4,
  })), [0.8, 1.2, 0.8]);

  // Wall-mounted hooks and woven bags leave the runner and door paths unobstructed.
  box(hallway, 1.035, 1.55, 5.25, 0.06, 0.12, 1.2, lightWoodMaterial);
  for (const z of [4.82, 5.25, 5.68]) {
    box(hallway, 0.99, 1.64, z, 0.16, 0.035, 0.035, darkMaterial);
    sphere(hallway, 0.89, 1.67, z, 0.055, lightWoodMaterial, [1, 0.8, 0.8]);
  }
  roundedBox(hallway, 0.78, 0.86, 4.82, 0.3, 0.66, 0.42, 0.08, terracottaMaterial);
  box(hallway, 0.78, 1.5, 4.82, 0.035, 0.1, 0.28, darkMaterial);
  addPlant(hallway, 0.68, -5.85, 0.82, terracottaMaterial, false);
  addPlant(hallway, -2.12, 0.72, 0.72, sageMaterial, false);

  addHallSideLights(hallway, 1.0, 6.4, 3.65);
  addHallSideLights(hallway, 1.0, 1.0, -6.2);
  const entryLightMaterial = registerGlowMaterial(new THREE.MeshStandardMaterial({
    color: "#ffe9a8",
    emissive: "#ffbd55",
    emissiveIntensity: 2.8,
    roughness: 0.25,
  }));
  for (let index = 0; index <= 12; index += 1) {
    const t = index / 12;
    const x = -1.9 + 1.8 * t;
    const y = 2.2 + Math.sin(t * Math.PI) * 0.04;
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), entryLightMaterial);
    bulb.position.set(x, y, 6.84);
    hallway.add(bulb);
    addFairyGlow(hallway, x, y, 6.84);
  }
  for (const x of [-1.9, -0.1]) {
    for (const y of [0.45, 0.85, 1.25, 1.65, 2.05]) {
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), entryLightMaterial);
      bulb.position.set(x, y, 6.84);
      hallway.add(bulb);
      addFairyGlow(hallway, x, y, 6.84);
    }
  }
  addTimedPointLight(hallway, -1, 1.85, 6.25, {
    distance: 5,
    levels: { daylight: 0.32, "golden-hour": 0.62, dusk: 1.0, night: 1.35 },
  });
  addTimedPointLight(hallway, -1.75, 1.45, 3.65, {
    color: "#ffd18b",
    distance: 4,
    levels: { daylight: 0.25, "golden-hour": 0.48, dusk: 0.82, night: 1.05 },
  });

  const garden = groupFor("garden");
  const gardenGrass = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 17),
    new THREE.MeshStandardMaterial({ color: "#82956f", roughness: 1 }),
  );
  gardenGrass.rotation.x = -Math.PI / 2;
  gardenGrass.position.set(-1, -0.02, -15.4);
  gardenGrass.receiveShadow = true;
  garden.add(gardenGrass);
  const pathStoneMaterial = new THREE.MeshStandardMaterial({ color: "#c9c0aa", roughness: 1 });
  const patioMaterial = new THREE.MeshStandardMaterial({ color: "#8e887b", roughness: 1 });
  const patio = new THREE.Mesh(new THREE.PlaneGeometry(15.5, 12.5), patioMaterial);
  patio.rotation.x = -Math.PI / 2;
  patio.position.set(-0.8, 0.006, -13.9);
  patio.receiveShadow = true;
  garden.add(patio);
  const patioBorderMaterial = new THREE.MeshStandardMaterial({ color: "#b5aa94", roughness: 1 });
  for (const x of [-8.15, 6.55]) {
    for (let index = 0; index < 18; index += 1) {
      const z = -8.0 - index * 0.68;
      const pebble = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.13 + (index % 3) * 0.025, 0),
        index % 2 === 0 ? pathStoneMaterial : patioBorderMaterial,
      );
      pebble.position.set(x + Math.sin(index * 1.8) * 0.18, 0.1, z);
      pebble.scale.set(1.3, 0.32, 0.9);
      pebble.rotation.y = index * 0.47;
      pebble.receiveShadow = true;
      garden.add(pebble);
    }
  }
  for (const [index, z] of [-8.1, -9.35, -10.6, -11.85, -13.1, -14.35, -15.6].entries()) {
    const offset = index % 2 === 0 ? 0 : 0.16;
    const stone = roundedBox(garden, rearDoorCenter + offset, -0.02, z, 0.95, 0.12, 0.78, 0.08, pathStoneMaterial, false);
    stone.rotation.y = (index % 2 === 0 ? -1 : 1) * 0.045;
  }
  const pathLightMaterial = registerGlowMaterial(new THREE.MeshStandardMaterial({
    color: "#ffe2a6",
    emissive: "#f3b85e",
    emissiveIntensity: 1.15,
    roughness: 0.55,
  }));
  for (const z of [-8.7, -11.2, -13.7, -16.2]) {
    for (const side of [-1, 1]) {
      const x = rearDoorCenter + side * 1.15;
      cylinder(garden, x, -0.02, z, 0.055, 0.075, 0.42, darkMaterial, 8);
      sphere(garden, x, 0.48, z, 0.12, pathLightMaterial, [0.8, 0.8, 0.8]);
    }
    addTimedPointLight(garden, rearDoorCenter, 0.38, z, {
      color: "#ffc46f",
      distance: 3,
      levels: { daylight: 0.04, "golden-hour": 0.12, dusk: 0.35, night: 0.58 },
    });
  }

  const trunkMaterial = new THREE.MeshStandardMaterial({ color: "#70513d", roughness: 1 });
  const branchMaterial = new THREE.MeshStandardMaterial({ color: "#806047", roughness: 1 });
  const treeLightMaterial = registerGlowMaterial(new THREE.MeshStandardMaterial({
    color: "#ffefc0",
    emissive: "#ffc65e",
    emissiveIntensity: 3,
    roughness: 0.22,
  }));
  const treeWireMaterial = new THREE.MeshStandardMaterial({ color: "#54473a", roughness: 0.8 });
  const treehouseWallMaterial = new THREE.MeshStandardMaterial({ color: "#aa7c53", roughness: 0.9 });
  const treehouseRoofMaterial = new THREE.MeshStandardMaterial({ color: "#596d57", roughness: 0.92 });
  const treehouseWindowMaterial = registerGlowMaterial(new THREE.MeshStandardMaterial({
    color: "#fff0c7",
    emissive: "#f5b968",
    emissiveIntensity: 0.5,
    roughness: 0.28,
    transparent: true,
    opacity: 0.82,
  }));
  const bottleGlowMaterial = registerGlowMaterial(new THREE.MeshStandardMaterial({
    color: "#fff0c7",
    emissive: "#f4a94f",
    emissiveIntensity: 2.2,
    roughness: 0.18,
    metalness: 0.05,
    transparent: true,
    opacity: 0.82,
  }));

  function addBottleLantern(x, z, branchY, height = 0.82) {
    const bottle = new THREE.Group();
    bottle.position.set(x, branchY, z);
    garden.add(bottle);
    const bottleMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.16, height, 12), bottleGlowMaterial);
    bottleMesh.position.y = -height / 2;
    bottleMesh.castShadow = true;
    bottle.add(bottleMesh);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.075, 0.19, 10), bottleGlowMaterial);
    neck.position.y = -height - 0.1;
    bottle.add(neck);
    cylinder(bottle, 0, -height - 0.2, 0, 0.07, 0.07, 0.06, treeWireMaterial, 10);
    const internalGlow = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), treeLightMaterial);
    internalGlow.position.set(0, -height * 0.5, 0);
    bottle.add(internalGlow);
    const cordPoints = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.035, -0.08, 0),
      new THREE.Vector3(0, -height - 0.2, 0),
    ];
    bottle.add(new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cordPoints), 12, 0.018, 5, false),
      treeWireMaterial,
    ));
    addTimedPointLight(bottle, 0, -height * 0.5, 0, {
      color: "#ffbf76",
      distance: 2.8,
      levels: { daylight: 0.06, "golden-hour": 0.2, dusk: 0.55, night: 0.78 },
    });
  }

  function addFairyLitTree(treeX, treeZ, scale = 1, bottleCount = 2, withTreehouse = false) {
    const tree = new THREE.Group();
    tree.position.set(treeX, 0, treeZ);
    tree.scale.setScalar(scale);
    garden.add(tree);
    cylinder(tree, 0, 0, 0, 0.24, 0.33, 3.25, trunkMaterial, 12);
    for (const [branchX, branchY, branchZ, tilt] of [
      [-0.95, 2.05, 0, -0.42],
      [0.9, 2.3, -0.1, 0.45],
      [-0.55, 2.75, -0.1, -0.3],
      [0.55, 2.95, 0.12, 0.32],
    ]) {
      const branch = cylinder(tree, branchX * 0.48, branchY, branchZ, 0.075, 0.13, 1.45, branchMaterial, 8);
      branch.rotation.z = tilt;
    }
    const canopy = withTreehouse
      ? [
          [-1.45, 2.7, 0, 0.9],
          [-1.25, 3.65, 0.08, 0.9],
          [3.75, 2.75, -0.05, 0.92],
          [3.7, 3.72, 0.05, 0.9],
          [-0.75, 4.55, 0, 0.9],
          [3.1, 4.62, 0.1, 0.9],
          [0.9, 5.25, -0.04, 0.82],
        ]
      : [
      [-1.05, 2.6, 0, 1.25],
      [0, 3.05, 0.12, 1.5],
      [1.05, 2.7, -0.05, 1.18],
      [-0.55, 3.65, 0, 1.08],
      [0.6, 3.75, 0.1, 1.05],
      [0, 4.25, -0.04, 0.92],
        ];
    for (const [x, y, z, size] of canopy) {
      sphere(tree, x, y, z, size, greenMaterials[Math.abs(Math.round((x + y) * 2)) % greenMaterials.length], [1, 0.9, 0.92]);
    }

    if (withTreehouse) {
      const treehouse = new THREE.Group();
      treehouse.position.set(1.55, 2.45, -1.1);
      tree.add(treehouse);

      roundedBox(treehouse, 0, 0, 0, 2.8, 0.16, 2.35, 0.08, lightWoodMaterial);
      for (const z of [-0.72, 0.72]) {
        box(treehouse, -0.8, -0.2, z, 1.8, 0.18, 0.16, woodMaterial);
      }
      for (const x of [-1.12, 1.12]) {
        for (const z of [-0.84, 0.84]) {
          box(treehouse, x, -2.35, z, 0.14, 2.35, 0.14, woodMaterial);
        }
      }
      for (const x of [-1, 1]) {
        const brace = box(treehouse, x, -1.45, 0, 0.11, 1.85, 0.11, lightWoodMaterial);
        brace.rotation.z = x < 0 ? -0.56 : 0.56;
      }

      box(treehouse, -1.12, 0, 0, 0.14, 1.35, 1.78, treehouseWallMaterial);
      box(treehouse, 1.12, 0, 0, 0.14, 1.35, 1.78, treehouseWallMaterial);
      box(treehouse, 0, 0, -0.82, 2.22, 1.35, 0.14, treehouseWallMaterial);
      box(treehouse, -0.86, 0, 0.82, 0.52, 1.35, 0.14, treehouseWallMaterial);
      box(treehouse, 0.86, 0, 0.82, 0.52, 1.35, 0.14, treehouseWallMaterial);
      for (let boardY = 0.16; boardY < 1.3; boardY += 0.22) {
        box(treehouse, -1.21, boardY, 0, 0.055, 0.12, 1.82, lightWoodMaterial);
        box(treehouse, 1.21, boardY, 0, 0.055, 0.12, 1.82, lightWoodMaterial);
        box(treehouse, 0, boardY, -0.91, 2.24, 0.12, 0.055, lightWoodMaterial);
        box(treehouse, -0.86, boardY, 0.91, 0.52, 0.12, 0.055, lightWoodMaterial);
        box(treehouse, 0.86, boardY, 0.91, 0.52, 0.12, 0.055, lightWoodMaterial);
      }
      const roof = box(treehouse, 0, 1.48, 0, 2.7, 0.16, 2.42, treehouseRoofMaterial);
      roof.rotation.z = -0.1;

      const ladder = new THREE.Group();
      ladder.position.set(1.55, 0, 0.55);
      ladder.rotation.x = -0.3;
      tree.add(ladder);
      for (const x of [-0.48, 0.48]) {
        box(ladder, x, 0, 0, 0.09, 2.78, 0.1, woodMaterial);
      }
      for (let rung = 0; rung < 8; rung += 1) {
        box(ladder, 0, 0.18 + rung * 0.34, 0, 0.92, 0.075, 0.1, lightWoodMaterial);
      }

      for (const z of [-0.43, 0.43]) {
        roundedBox(treehouse, 1.26, 0.78, z, 0.035, 0.5, 0.42, 0.035, treehouseWindowMaterial, false);
        box(treehouse, 1.3, 0.53, z, 0.07, 0.055, 0.46, lightWoodMaterial);
        box(treehouse, 1.3, 0.78, z, 0.07, 0.5, 0.045, lightWoodMaterial);
      }
    }

    const wirePoints = [];
    const bulbs = [];
    for (let index = 0; index <= 52; index += 1) {
      const t = index / 52;
      const angle = t * Math.PI * 8;
      const radius = 0.38 + t * 1.12;
      const point = new THREE.Vector3(
        Math.cos(angle) * radius,
        0.65 + t * 3.35,
        Math.sin(angle) * radius * 0.72,
      );
      wirePoints.push(point);
      if (index % 2 === 0) bulbs.push(point);
    }
    tree.add(new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(wirePoints), 180, 0.018, 5, false),
      treeWireMaterial,
    ));
    for (const point of bulbs) {
      sphere(tree, point.x, point.y, point.z, 0.085, treeLightMaterial, [0.82, 1, 0.82]);
    }
    addTimedPointLight(tree, 0, 2.6, 0, {
      color: "#ffd185",
      distance: 7,
      levels: { daylight: 0.18, "golden-hour": 0.42, dusk: 0.75, night: 0.95 },
    });

    for (let index = 0; index < bottleCount; index += 1) {
      const side = index % 2 === 0 ? -1 : 1;
      addBottleLantern(
        treeX + side * (0.75 + Math.floor(index / 2) * 0.28),
        treeZ + (index % 3 - 1) * 0.22,
        2.75 + (index % 2) * 0.38,
        0.72 + (index % 2) * 0.12,
      );
    }
  }

  addFairyLitTree(3.2, -17.4, 1, 3, true);
  addFairyLitTree(-7.1, -18.8, 0.76, 2);
  addFairyLitTree(6.15, -20.0, 0.82, 2);

  const gardenSeating = new THREE.Group();
  gardenSeating.position.set(2.15, 0, -12.35);
  garden.add(gardenSeating);
  addSoftRug(gardenSeating, 0.4, -2.3, 5.8, 4.7, new THREE.MeshStandardMaterial({ color: "#a8a18a", roughness: 1 }));
  addNappySofa(
    gardenSeating,
    0.1,
    0.15,
    2.8,
    new THREE.MeshStandardMaterial({ color: "#71816d", roughness: 0.96 }),
    fabricMaterial,
    0,
  );
  addChair(gardenSeating, -1.15, -3.15, Math.PI / 2, woodMaterial, fabricMaterial);
  addChair(gardenSeating, 1.95, -3.15, -Math.PI / 2, woodMaterial, fabricMaterial);
  const firePit = new THREE.Group();
  firePit.position.set(0.35, 0, -2.8);
  gardenSeating.add(firePit);
  cylinder(firePit, 0, 0, 0, 0.78, 0.9, 0.34, darkMaterial, 24);
  cylinder(firePit, 0, 0.33, 0, 0.69, 0.72, 0.1, woodMaterial, 24);
  const stoneRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.82, 0.13, 8, 32),
    patioBorderMaterial,
  );
  stoneRing.position.y = 0.3;
  stoneRing.rotation.x = Math.PI / 2;
  firePit.add(stoneRing);
  const flameMaterial = registerGlowMaterial(new THREE.MeshStandardMaterial({
    color: "#ffbd62",
    emissive: "#ff5b18",
    emissiveIntensity: 2.8,
    roughness: 0.5,
  }));
  const flameCoreMaterial = registerGlowMaterial(new THREE.MeshStandardMaterial({
    color: "#fff0b0",
    emissive: "#ff9d28",
    emissiveIntensity: 3.5,
    roughness: 0.45,
  }));
  for (const [x, height, z, radius] of [
    [-0.24, 0.78, 0, 0.23],
    [0.12, 1.02, 0.08, 0.28],
    [0.32, 0.68, -0.12, 0.2],
  ]) {
    const flame = new THREE.Mesh(new THREE.ConeGeometry(radius, height, 9), flameMaterial);
    flame.position.set(x, 0.42 + height / 2, z);
    firePit.add(flame);
  }
  const fireCore = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.72, 8), flameCoreMaterial);
  fireCore.position.set(0.05, 0.78, 0.03);
  firePit.add(fireCore);
  addTimedPointLight(firePit, 0, 0.8, 0, {
    color: "#ff8b3d",
    distance: 7,
    levels: { daylight: 0.18, "golden-hour": 0.58, dusk: 1.3, night: 1.9 },
  });
  const gardenTable = new THREE.Group();
  gardenTable.position.set(2.45, 0, -3.05);
  gardenSeating.add(gardenTable);
  cylinder(gardenTable, 0, 0, 0, 0.12, 0.16, 0.62, woodMaterial, 12);
  roundedBox(gardenTable, 0, 0.62, 0, 0.95, 0.12, 0.72, 0.16, lightWoodMaterial);
  cylinder(gardenTable, -0.2, 0.75, 0, 0.08, 0.1, 0.12, terracottaMaterial, 12);
  addPlant(gardenSeating, 3.25, -0.7, 0.9, terracottaMaterial, false);
  addTimedPointLight(gardenSeating, 1.2, 2.1, -1.5, {
    color: "#ffd18b",
    distance: 7,
    levels: { daylight: 0.08, "golden-hour": 0.24, dusk: 0.58, night: 0.8 },
  });

  const patioStringBulbMaterial = registerGlowMaterial(new THREE.MeshStandardMaterial({
    color: "#fff0cf",
    emissive: "#ffc16b",
    emissiveIntensity: 3.2,
    roughness: 0.2,
  }));
  const patioStringWireMaterial = new THREE.MeshStandardMaterial({ color: "#4a3a2b", roughness: 0.85 });
  for (const [start, end] of [
    [new THREE.Vector3(-6.8, 4.9, -10.2), new THREE.Vector3(5.7, 4.5, -10.2)],
    [new THREE.Vector3(-6.8, 4.8, -10.2), new THREE.Vector3(3.2, 5.0, -18.0)],
    [new THREE.Vector3(5.7, 4.5, -10.2), new THREE.Vector3(3.2, 5.0, -18.0)],
  ]) {
    const points = [
      start,
      new THREE.Vector3((start.x + end.x) / 2, Math.min(start.y, end.y) - 0.85, (start.z + end.z) / 2),
      end,
    ];
    garden.add(new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 32, 0.018, 5, false),
      patioStringWireMaterial,
    ));
    for (let index = 0; index <= 10; index += 1) {
      const point = new THREE.CatmullRomCurve3(points).getPoint(index / 10);
      sphere(garden, point.x, point.y, point.z, 0.075, patioStringBulbMaterial, [0.85, 1, 0.85]);
    }
  }
  addTimedPointLight(garden, -0.2, 3.7, -12.4, {
    color: "#ffd18b",
    distance: 11,
    levels: { daylight: 0.1, "golden-hour": 0.28, dusk: 0.65, night: 0.95 },
  });

  const groundMaterial = new THREE.MeshStandardMaterial({ color: "#eeece4", roughness: 1 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.36;
  ground.receiveShadow = true;
  scene.add(ground);

  for (const [parent, orientations] of lighting.fairyGlowPositions) {
    for (const positions of Object.values(orientations)) {
      if (positions.length === 0) continue;
      const glows = new THREE.InstancedMesh(fairyHaloGeometry, lighting.fairyHaloMaterial, positions.length);
      const transform = new THREE.Object3D();
      for (let index = 0; index < positions.length; index += 1) {
        const position = positions[index];
        transform.position.set(position.x, position.y, position.z);
        transform.rotation.set(0, position.rotation, 0);
        transform.updateMatrix();
        glows.setMatrixAt(index, transform.matrix);
      }
      glows.instanceMatrix.needsUpdate = true;
      glows.renderOrder = 2;
      parent.add(glows);
    }
  }

  const timePresets = {
    daylight: {
      background: "#eeece4",
      ground: "#dedbd0",
      hemisphere: 1.75,
      sun: 2.5,
      fill: 0.8,
      exposure: 1.15,
      glow: 0.78,
      haloOpacity: 0.18,
      sunColor: "#fff1dc",
      skyColor: "#fff6e8",
      bounceColor: "#8c927d",
      fillColor: "#e6eddf",
      windowColor: "#fff2dc",
      sunPosition: [-6, 14, 8],
    },
    "golden-hour": {
      background: "#e9dfcf",
      ground: "#d4c4a9",
      hemisphere: 1.3,
      sun: 1.9,
      fill: 0.58,
      exposure: 1.15,
      glow: 1,
      haloOpacity: 0.25,
      sunColor: "#ffd09a",
      skyColor: "#ffebd2",
      bounceColor: "#8c765f",
      fillColor: "#f2d8b5",
      windowColor: "#ffe0b0",
      sunPosition: [-12, 9, 4],
    },
    dusk: {
      background: "#68636a",
      ground: "#45463f",
      hemisphere: 0.72,
      sun: 0.4,
      fill: 0.2,
      exposure: 1.08,
      glow: 1.25,
      haloOpacity: 0.38,
      sunColor: "#efaa82",
      skyColor: "#b9b5c4",
      bounceColor: "#565157",
      fillColor: "#c9a39a",
      windowColor: "#ffc17c",
      sunPosition: [-10, 4, -6],
    },
    night: {
      background: "#1a2330",
      ground: "#202721",
      hemisphere: 0.34,
      sun: 0.04,
      fill: 0.1,
      exposure: 1.02,
      glow: 1.55,
      haloOpacity: 0.52,
      sunColor: "#aebbd1",
      skyColor: "#8495b8",
      bounceColor: "#303a49",
      fillColor: "#8798b7",
      windowColor: "#ffb66e",
      sunPosition: [2, 5, -10],
    },
  };

  function setTimeOfDay(mode) {
    const preset = timePresets[mode];
    if (!preset) throw new RangeError(`Unknown time-of-day preset: ${mode}`);
    scene.background.set(preset.background);
    scene.fog.color.set(preset.background);
    groundMaterial.color.set(preset.ground);
    lighting.hemisphere.color.set(preset.skyColor);
    lighting.hemisphere.groundColor.set(preset.bounceColor);
    lighting.hemisphere.intensity = preset.hemisphere;
    sun.intensity = preset.sun;
    sun.color.set(preset.sunColor);
    sun.position.set(...preset.sunPosition);
    fill.intensity = preset.fill;
    fill.color.set(preset.fillColor);
    renderer.toneMappingExposure = preset.exposure;
    for (const { material, baseIntensity } of lighting.glowMaterials) {
      material.emissiveIntensity = baseIntensity * preset.glow;
    }
    lighting.fairyHaloMaterial.opacity = preset.haloOpacity;
    for (const { light, levels, isWindow } of lighting.pointLights) {
      light.intensity = levels[mode];
      if (isWindow) light.color.set(preset.windowColor);
    }
    renderer.shadowMap.needsUpdate = true;
    requestFrame();
  }

  const worldFocus = (position) => home.localToWorld(position.clone());
  const roomPoints = new Map(
    rooms.map((room) => [room.id, worldFocus(new THREE.Vector3(room.focus.x, 2.15, room.focus.z))]),
  );
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let pointerDown = null;
  let transition = null;
  let markerUpdateNeeded = true;

  function onPointerDown(event) {
    pointerDown = { x: event.clientX, y: event.clientY };
  }

  function onPointerUp(event) {
    if (!pointerDown || Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) > 6) {
      pointerDown = null;
      return;
    }
    pointerDown = null;
    const bounds = renderer.domElement.getBoundingClientRect();
    pointer.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    const target = raycaster.intersectObjects(home.children, true).find((hit) => {
      let current = hit.object;
      while (current && !current.userData.roomId) current = current.parent;
      return Boolean(current?.userData.roomId);
    });
    if (target) {
      let current = target.object;
      while (current && !current.userData.roomId) current = current.parent;
      const room = rooms.find((item) => item.id === current?.userData.roomId);
      if (room) onRoomSelect(room);
    }
  }

  renderer.domElement.addEventListener("pointerdown", onPointerDown);
  renderer.domElement.addEventListener("pointerup", onPointerUp);

  function transitionTo(position, reset = false, cameraOffset = null) {
    transition = {
      startedAt: performance.now(),
      duration: reset ? 900 : 700,
      fromTarget: controls.target.clone(),
      toTarget: position.clone(),
      fromPosition: camera.position.clone(),
      toPosition: reset
        ? new THREE.Vector3(29, 23, 32)
        : position.clone().add(cameraOffset ?? new THREE.Vector3(10.3, 9.2, 11.8)),
    };
    markerUpdateNeeded = true;
    requestFrame();
  }

  controls.addEventListener("start", () => {
    transition = null;
    requestFrame();
  });
  controls.addEventListener("change", () => {
    markerUpdateNeeded = true;
    if (!renderingFrame) requestFrame();
  });

  function zoomBy(factor) {
    const direction = new THREE.Vector3().subVectors(camera.position, controls.target);
    camera.position.addScaledVector(direction, factor);
    controls.update();
  }

  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.fov = width < 760 ? 39 : 34;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    markerUpdateNeeded = true;
    requestFrame();
  }

  function positionMarkers() {
    for (const room of rooms) {
      const marker = markerContainer.querySelector(`[data-room="${room.id}"]`);
      if (!marker) continue;
      const point = roomPoints.get(room.id).clone().project(camera);
      const x = (point.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-point.y * 0.5 + 0.5) * window.innerHeight;
      const visible = point.z > -1 && point.z < 1 && x > 330 && x < window.innerWidth - 320;
      marker.style.left = `${x}px`;
      marker.style.top = `${y}px`;
      marker.style.opacity = visible ? "1" : "0";
      marker.style.pointerEvents = visible ? "auto" : "none";
    }
  }

  let frameId = null;
  let renderingFrame = false;
  function requestFrame() {
    if (frameId === null) frameId = requestAnimationFrame(animate);
  }

  function animate(now) {
    frameId = null;
    renderingFrame = true;
    let cameraChanged = false;
    if (transition) {
      const elapsed = Math.min((now - transition.startedAt) / transition.duration, 1);
      const ease = elapsed < 0.5 ? 4 * elapsed ** 3 : 1 - ((-2 * elapsed + 2) ** 3) / 2;
      controls.target.lerpVectors(transition.fromTarget, transition.toTarget, ease);
      camera.position.lerpVectors(transition.fromPosition, transition.toPosition, ease);
      if (elapsed === 1) transition = null;
      cameraChanged = true;
    }
    const controlsChanged = controls.update();
    if (cameraChanged || markerUpdateNeeded) {
      positionMarkers();
      markerUpdateNeeded = false;
    }
    renderer.render(scene, camera);
    renderingFrame = false;
    if (transition || controlsChanged) requestFrame();
  }

  function onPointerMove() {
    requestFrame();
  }

  window.addEventListener("resize", resize);
  renderer.domElement.addEventListener("pointermove", onPointerMove);
  setTimeOfDay("golden-hour");
  resize();

  return {
    camera,
    controls,
    transitionTo,
    zoomBy,
    worldFocus,
    setTimeOfDay,
    dispose() {
      if (frameId !== null) cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      controls.dispose();
      const geometries = new Set();
      const materials = new Set();
      scene.traverse((object) => {
        if (!object.isMesh) return;
        geometries.add(object.geometry);
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
          materials.add(material);
        }
      });
      for (const geometry of geometries) geometry.dispose();
      for (const material of materials) material.dispose();
      lighting.fairyHaloMaterial.map.dispose();
      renderer.renderLists.dispose();
      renderer.dispose();
    },
  };
}
