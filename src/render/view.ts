import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { CSS2DObject, CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import {
  ASSEMBLER_PARTS,
  BUFFER_PARTS,
  CONSTRUCTOR_PARTS,
  FOUNDRY_PARTS,
  MERGER_PARTS,
  SMART_SPLITTER_PARTS,
  SMELTER_PARTS,
  SPLITTER_PARTS,
  type PartMaterial,
  type SolidPart,
} from "../data/parts";
import type { Plant, Solid, Vec3 } from "../layout/types";

const BELT_H = 1;
const BELT_W = 2;

export class FactoryView {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly labels: CSS2DRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.PerspectiveCamera;
  private readonly controls: OrbitControls;
  private readonly materials: Record<PartMaterial, THREE.MeshStandardMaterial>;
  private readonly hazard: THREE.MeshStandardMaterial;
  private readonly concrete: THREE.MeshStandardMaterial[];
  private readonly beltRail: THREE.MeshStandardMaterial;
  private readonly beltTop: THREE.MeshStandardMaterial;
  private readonly rampMat: THREE.MeshStandardMaterial;
  private readonly supportMat: THREE.MeshStandardMaterial;
  private readonly prototypes: Map<string, THREE.Group>;
  private plant: THREE.Group | null = null;
  private readonly sun: THREE.DirectionalLight;
  private disposed = false;

  constructor(host: HTMLElement) {
    const canvas = document.createElement("canvas");
    canvas.id = "factory-canvas";
    host.append(canvas);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(host.clientWidth, host.clientHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.96;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.background = new THREE.Color("#a7b4be");
    this.scene.fog = new THREE.Fog("#a7b4be", 220, 640);

    this.camera = new THREE.PerspectiveCamera(42, 1, 0.2, 2000);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.controls.dampingFactor = 0.08;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.06;
    this.controls.minDistance = 6;
    this.controls.maxDistance = 420;
    this.controls.target.set(24, 8, 8);

    this.labels = new CSS2DRenderer();
    this.labels.domElement.className = "labels";
    host.append(this.labels.domElement);

    this.materials = {
      body: metal("#4c555e", 0.55, 0.72),
      dark: metal("#2b3138", 0.35, 0.78),
      steel: metal("#6a737c", 0.72, 0.46),
      orange: metal("#e3942d", 0.22, 0.62),
      port: metal("#12151a", 0.4, 0.55),
      hazard: metal("#e0a020", 0.1, 0.7),
      splitter: metal("#d7a441", 0.28, 0.58),
    };
    this.hazard = this.materials.hazard;
    this.hazard.map = hazardTexture();
    this.hazard.color.set("#ffffff");

    const concreteMap = concreteTexture();
    const top = metal("#c4bfb4", 0.04, 0.92);
    top.map = concreteMap;
    top.color.set("#ffffff");
    const side = metal("#8e897f", 0.05, 0.9);
    this.concrete = [side, side, top, side, side, side];

    this.beltRail = metal("#2c3136", 0.45, 0.55);
    this.beltTop = metal("#4a5158", 0.25, 0.62);
    for (const beltMat of [this.beltRail, this.beltTop]) {
      beltMat.polygonOffset = true;
      beltMat.polygonOffsetFactor = -2;
      beltMat.polygonOffsetUnits = -4;
    }
    this.rampMat = metal("#9aa3ab", 0.55, 0.48);
    this.supportMat = metal("#5b534c", 0.4, 0.7);
    this.prototypes = new Map([
      ["smelter", groupFromParts(SMELTER_PARTS, this.materials)],
      ["constructor", groupFromParts(CONSTRUCTOR_PARTS, this.materials)],
      ["assembler", groupFromParts(ASSEMBLER_PARTS, this.materials)],
      ["foundry", groupFromParts(FOUNDRY_PARTS, this.materials)],
      ["splitter", groupFromParts(SPLITTER_PARTS, this.materials)],
      ["merger", groupFromParts(MERGER_PARTS, this.materials)],
      ["buffer", groupFromParts(BUFFER_PARTS, this.materials)],
      ["smartSplitter", groupFromParts(SMART_SPLITTER_PARTS, this.materials)],
      ["bank", groupFromParts(BUFFER_PARTS, this.materials)],
    ]);

    const hemi = new THREE.HemisphereLight("#d5e2ea", "#6d675e", 0.72);
    this.scene.add(hemi);
    this.sun = new THREE.DirectionalLight("#fff4e4", 1.85);
    this.sun.position.set(-40, 90, -30);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.camera.near = 10;
    this.sun.shadow.camera.far = 280;
    this.scene.add(this.sun, this.sun.target);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(420, 48),
      new THREE.MeshStandardMaterial({ color: "#6a645c", roughness: 1, metalness: 0 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.04;
    ground.receiveShadow = true;
    this.scene.add(ground);

    this.resize(host);
    const observer = new ResizeObserver(() => this.resize(host));
    observer.observe(host);

    const tick = () => {
      if (this.disposed) return;
      requestAnimationFrame(tick);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      this.labels.render(this.scene, this.camera);
    };
    tick();
  }

  clear(): void {
    this.releasePlant();
  }

  show(plant: Plant): void {
    this.releasePlant();
    const root = new THREE.Group();
    root.name = "plant";
    this.addFoundations(root, plant);
    this.addMachines(root, plant);
    this.addLogistics(root, plant);
    this.addBelts(root, plant);
    this.addRamps(root, plant);
    this.addSupports(root, plant);
    this.addLabels(root, plant);
    this.scene.add(root);
    this.plant = root;
    this.frame(root);
  }

  private releasePlant(): void {
    if (!this.plant) return;
    this.plant.traverse((obj) => {
      if (obj instanceof CSS2DObject) obj.element.remove();
    });
    this.scene.remove(this.plant);
    disposeTree(this.plant);
    this.plant = null;
  }

  private resize(host: HTMLElement): void {
    const width = host.clientWidth || 1;
    const height = host.clientHeight || 1;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.labels.setSize(width, height);
  }

  private frame(root: THREE.Object3D): void {
    const box = new THREE.Box3().setFromObject(root);
    const center = box.getCenter(new THREE.Vector3());
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const target = new THREE.Vector3(center.x, box.min.y + Math.min(8, sphere.radius * 0.15), center.z);
    const direction = new THREE.Vector3(-0.72, 0.48, -0.9).normalize();
    const vFov = THREE.MathUtils.degToRad(this.camera.fov);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * this.camera.aspect);
    const dist = (sphere.radius / Math.sin(Math.min(vFov, hFov) / 2)) * 1.18;
    this.camera.position.copy(target).addScaledVector(direction, dist);
    this.controls.target.copy(target);
    this.controls.update();
    const span = sphere.radius * 1.4;
    const shadow = this.sun.shadow.camera;
    shadow.left = -span;
    shadow.right = span;
    shadow.top = span;
    shadow.bottom = -span;
    shadow.updateProjectionMatrix();
    this.sun.position.set(center.x - span * 0.4, center.y + 80, center.z - span * 0.35);
    this.sun.target.position.copy(center);
    this.sun.target.updateMatrixWorld();
  }

  private addFoundations(root: THREE.Group, plant: Plant): void {
    const foundations = plant.solids.filter((solid) => solid.kind === "foundation");
    if (foundations.length === 0) return;
    const mesh = new THREE.InstancedMesh(
      new THREE.BoxGeometry(8, 1, 8),
      this.concrete,
      foundations.length,
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const dummy = new THREE.Object3D();
    foundations.forEach((solid, index) => {
      dummy.position.set(solid.base.x, solid.base.y + 0.5, solid.base.z);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
    root.add(mesh);
  }

  private addMachines(root: THREE.Group, plant: Plant): void {
    for (const solid of plant.solids) {
      if (solid.kind !== "machine" || !solid.buildingId) continue;
      const proto = this.prototypes.get(solid.buildingId);
      if (!proto) continue;
      const mesh = proto.clone(true);
      placeBase(mesh, solid);
      root.add(mesh);
    }
  }

  private addLogistics(root: THREE.Group, plant: Plant): void {
    for (const solid of plant.solids) {
      if (
        solid.kind === "splitter" ||
        solid.kind === "merger" ||
        solid.kind === "buffer" ||
        solid.kind === "smartSplitter" ||
        solid.kind === "bank"
      ) {
        const proto = this.prototypes.get(solid.kind);
        if (!proto) continue;
        const mesh = proto.clone(true);
        placeBase(mesh, solid);
        if (solid.kind === "smartSplitter") mesh.rotation.y = Math.PI;
        root.add(mesh);
      } else if (solid.kind === "lift") {
        root.add(liftMesh(solid, this.supportMat, this.beltTop));
      }
    }
  }

  private addBelts(root: THREE.Group, plant: Plant): void {
    for (const belt of plant.belts) root.add(beltMesh(belt.from, belt.to, this.beltRail, this.beltTop));
  }

  private addRamps(root: THREE.Group, plant: Plant): void {
    for (const ramp of plant.ramps) root.add(rampMesh(ramp.from, ramp.to, ramp.width, this.rampMat, this.supportMat));
  }

  private addSupports(root: THREE.Group, plant: Plant): void {
    for (const solid of plant.solids) {
      if (solid.kind !== "support") continue;
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(solid.size.x, solid.size.y, solid.size.z), this.supportMat);
      mesh.position.set(solid.base.x, solid.base.y + solid.size.y / 2, solid.base.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      root.add(mesh);
    }
  }

  private addLabels(root: THREE.Group, plant: Plant): void {
    for (const label of plant.labels) {
      const div = document.createElement("div");
      div.className = "tag";
      div.textContent = label.text;
      const obj = new CSS2DObject(div);
      obj.position.set(label.position.x, label.position.y, label.position.z);
      root.add(obj);
    }
  }
}

function metal(color: string, metalness: number, roughness: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, metalness, roughness });
}

function groupFromParts(
  parts: SolidPart[],
  materials: Record<PartMaterial, THREE.MeshStandardMaterial>,
): THREE.Group {
  const group = new THREE.Group();
  for (const part of parts) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(part.size[0], part.size[1], part.size[2]), materials[part.material]);
    mesh.position.set(part.center[0], part.center[1], part.center[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.shared = true;
    group.add(mesh);
  }
  return group;
}

function placeBase(group: THREE.Object3D, solid: Solid): void {
  group.position.set(solid.base.x, solid.base.y, solid.base.z);
}

function beltMesh(
  from: Vec3,
  to: Vec3,
  railMat: THREE.Material,
  topMat: THREE.Material,
): THREE.Group {
  const direction = new THREE.Vector3(to.x - from.x, to.y - from.y, to.z - from.z);
  const length = Math.max(0.2, direction.length());
  const group = new THREE.Group();
  const rail = new THREE.BoxGeometry(length, BELT_H * 0.62, 0.1);
  const left = new THREE.Mesh(rail, railMat);
  left.position.set(0, 0.02, BELT_W / 2 - 0.08);
  const right = new THREE.Mesh(rail, railMat);
  right.position.set(0, 0.02, -(BELT_W / 2 - 0.08));
  const deck = new THREE.Mesh(new THREE.BoxGeometry(length, 0.1, BELT_W - 0.36), topMat);
  deck.position.y = 0.28;
  group.add(left, right, deck);

  const step = 4;
  const posts = Math.max(0, Math.floor(length / step) - 1);
  const postGeo = new THREE.BoxGeometry(0.16, 0.7, 0.16);
  for (let index = 1; index <= posts; index += 1) {
    const x = -length / 2 + index * step;
    for (const side of [-0.72, 0.72]) {
      const post = new THREE.Mesh(postGeo, railMat);
      post.position.set(x, -0.12, side);
      group.add(post);
    }
  }

  const chevronGeo = new THREE.ConeGeometry(0.16, 0.38, 4);
  const chevrons = Math.max(1, Math.floor(length / 3));
  for (let index = 0; index < chevrons; index += 1) {
    const mark = new THREE.Mesh(chevronGeo, topMat);
    mark.rotation.z = -Math.PI / 2;
    mark.position.set(-length / 2 + ((index + 0.65) * length) / chevrons, 0.36, 0);
    group.add(mark);
  }

  group.position.set((from.x + to.x) / 2, (from.y + to.y) / 2, (from.z + to.z) / 2);
  group.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), direction.normalize());
  for (const child of group.children) {
    const mesh = child as THREE.Mesh;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  }
  return group;
}

function liftMesh(solid: Solid, frameMat: THREE.Material, beltMat: THREE.Material): THREE.Group {
  const group = new THREE.Group();
  const height = solid.size.y;
  const post = new THREE.BoxGeometry(0.18, height, 0.18);
  for (const [x, z] of [
    [-0.78, -0.78],
    [0.78, -0.78],
    [-0.78, 0.78],
    [0.78, 0.78],
  ] as const) {
    const mesh = new THREE.Mesh(post, frameMat);
    mesh.position.set(x, height / 2, z);
    mesh.castShadow = true;
    group.add(mesh);
  }
  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.7, height, 0.1), beltMat);
  belt.position.y = height / 2;
  belt.castShadow = true;
  group.add(belt);
  const braceGeo = new THREE.BoxGeometry(1.7, 0.1, 0.1);
  for (let y = 2; y < height; y += 4) {
    const brace = new THREE.Mesh(braceGeo, frameMat);
    brace.position.y = y;
    group.add(brace);
    const side = brace.clone();
    side.rotation.y = Math.PI / 2;
    group.add(side);
  }
  group.position.set(solid.base.x, solid.base.y, solid.base.z);
  return group;
}

function rampMesh(
  from: Vec3,
  to: Vec3,
  width: number,
  deckMat: THREE.Material,
  frameMat: THREE.Material,
): THREE.Group {
  const group = new THREE.Group();
  const run = Math.hypot(to.x - from.x, to.y - from.y);
  const deck = new THREE.Mesh(new THREE.BoxGeometry(run, 0.14, width - 0.2), deckMat);
  deck.castShadow = true;
  deck.receiveShadow = true;
  const railGeo = new THREE.BoxGeometry(run, 0.08, 0.08);
  const railY = 1.05;
  const railZ = width / 2 - 0.12;
  for (const side of [-railZ, railZ]) {
    const top = new THREE.Mesh(railGeo, frameMat);
    top.position.set(0, railY, side);
    const mid = new THREE.Mesh(railGeo, frameMat);
    mid.position.set(0, railY * 0.45, side);
    group.add(top, mid);
  }
  const postGeo = new THREE.BoxGeometry(0.08, railY, 0.08);
  for (const x of [-run / 2, 0, run / 2]) {
    for (const z of [-railZ, railZ]) {
      const post = new THREE.Mesh(postGeo, frameMat);
      post.position.set(x, railY / 2, z);
      group.add(post);
    }
  }
  group.add(deck);
  group.position.set((from.x + to.x) / 2, (from.y + to.y) / 2, from.z);
  group.rotation.z = Math.atan2(to.y - from.y, to.x - from.x);

  const legTo = storyWalkBelow(to.y);
  if (legTo !== null && to.y - legTo > 0.4) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.28, to.y - legTo, 0.28), frameMat);
    leg.position.set(to.x, (to.y + legTo) / 2, to.z);
    leg.castShadow = true;
    const parent = new THREE.Group();
    parent.add(group, leg);
    return parent;
  }
  return group;
}

/** Walk surfaces are 1 m, then every 12 m. Legs stop at the story under this point. */
function storyWalkBelow(y: number): number | null {
  const base = 1;
  const pitch = 12;
  if (Math.abs((y - base) / pitch - Math.round((y - base) / pitch)) < 1e-3) return null;
  const steps = Math.floor((y - base - 1e-3) / pitch);
  if (steps < 0) return null;
  return base + steps * pitch;
}

function concreteTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);
  ctx.fillStyle = "#b3ad9f";
  ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 280; i += 1) {
    const shade = 150 + (hash(i) % 40);
    ctx.fillStyle = `rgba(${shade}, ${shade - 4}, ${shade - 10}, 0.18)`;
    ctx.fillRect(hash(i + 3) % 128, hash(i + 9) % 128, 2, 2);
  }
  ctx.strokeStyle = "#4e4942";
  ctx.lineWidth = 14;
  ctx.strokeRect(7, 7, 114, 114);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function hazardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 16;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);
  ctx.fillStyle = "#1a1c1f";
  ctx.fillRect(0, 0, 64, 16);
  ctx.fillStyle = "#e3942d";
  for (let x = -16; x < 64; x += 16) {
    ctx.beginPath();
    ctx.moveTo(x, 16);
    ctx.lineTo(x + 8, 16);
    ctx.lineTo(x + 16, 0);
    ctx.lineTo(x + 8, 0);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.set(3, 1);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function hash(value: number): number {
  let x = value | 0;
  x = Math.imul(x ^ (x >>> 16), 0x7feb352d);
  x = Math.imul(x ^ (x >>> 15), 0x846ca68b);
  return (x ^ (x >>> 16)) >>> 0;
}

function disposeTree(root: THREE.Object3D): void {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry && !mesh.userData.shared) mesh.geometry.dispose();
  });
}
