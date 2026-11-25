// Lazy chunk for ProductMedia: everything that needs three.js lives here.
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RotateCcw, Sun, SunDim, Waves, RotateCw } from "lucide-react";
import { MEDIA_STRINGS } from "../utils/productMedia";

const YAW = THREE.MathUtils.degToRad(35);
const PITCH = THREE.MathUtils.degToRad(15);
const Z0 = 4.2;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const prefersReducedMotion = () =>
  typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const LIGHTS = {
  neutral: { color: 0xffffff, intensity: 0.45, env: 0.7 },
  warm: { color: 0xffd6a0, intensity: 0.8, env: 0.5 },
};

function disposeObject(root) {
  root.traverse((o) => {
    o.geometry?.dispose();
    [].concat(o.material || []).forEach((m) => {
      Object.values(m).forEach((v) => v?.isTexture && v.dispose());
      m.dispose();
    });
  });
}

// Renderer + scene + camera in `mountRef`, running `setup`'s tick; pauses off-screen / tab hidden; disposes all.
function useStage(mountRef, onFail, setup, deps) {
  const failRef = useRef(onFail);
  failRef.current = onFail;

  useEffect(() => {
    const mount = mountRef.current;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      failRef.current("webgl");
      return undefined;
    }
    const canvas = renderer.domElement;
    canvas.style.display = "block";
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    mount.appendChild(canvas);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04).texture;
    disposeObject(room);
    scene.environment = env;
    const camera = new THREE.PerspectiveCamera(35, 1, 0.05, 100);
    const stage = setup({ renderer, scene, camera, canvas });

    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    let onScreen = true;
    let raf = 0;
    const loop = () => {
      raf = 0;
      if (!onScreen || document.hidden) return;
      stage.tick?.();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    const wake = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      wake();
    });
    io.observe(mount);
    document.addEventListener("visibilitychange", wake);
    const onLost = (e) => {
      e.preventDefault();
      failRef.current("webgl");
    };
    canvas.addEventListener("webglcontextlost", onLost);
    wake();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", wake);
      canvas.removeEventListener("webglcontextlost", onLost);
      stage.dispose?.();
      disposeObject(scene);
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// Soft contact shadow so the board sits on a stage without heavy shadows.
function makeShadowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(0,0,0,0.28)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

const btn =
  "inline-flex h-8 items-center justify-center gap-1 rounded-[3px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2 text-xs text-[var(--ink-main)] transition hover:border-[var(--accent-gold)] focus-visible:outline-2 focus-visible:outline-[var(--accent-pine)] aria-pressed:bg-[var(--accent-pine)] aria-pressed:text-white aria-pressed:border-[var(--accent-pine)]";

/** Mode 2: the real photo on a thin board, true aspect ratio, rotation clamped so no invented sides show. */
export function PhotoStage3D({ src, lang, onFail, heightClass }) {
  const s = MEDIA_STRINGS[lang] || MEDIA_STRINGS.en;
  const reduce = prefersReducedMotion();
  const mountRef = useRef(null);
  const view = useRef({ yaw: 0, pitch: 0, z: Z0, ty: 0, tp: 0, tz: Z0 });
  const pointers = useRef(new Map());
  const [light, setLight] = useState("neutral");
  const [sway, setSway] = useState(false);
  const [loading, setLoading] = useState(true);
  const lightRef = useRef(light);
  const swayRef = useRef(sway);
  lightRef.current = light;
  swayRef.current = sway && !reduce;

  useStage(
    mountRef,
    onFail,
    ({ renderer, scene, camera }) => {
      camera.position.set(0, 0.45, Z0);
      camera.lookAt(0, 0, 0);
      const key = new THREE.DirectionalLight(0xffffff, 1);
      key.position.set(2.5, 3, 4);
      scene.add(key);
      const board = new THREE.Group();
      scene.add(board);
      let disposed = false;
      setLoading(true);

      new THREE.TextureLoader().load(
        src,
        (tex) => {
          if (disposed) return tex.dispose();
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
          const iw = tex.image.naturalWidth || tex.image.width;
          const ih = tex.image.naturalHeight || tex.image.height;
          const aspect = iw / ih || 1;
          const w = aspect >= 1 ? 2 : 2 * aspect;
          const h = aspect >= 1 ? 2 / aspect : 2;
          const plain = new THREE.MeshStandardMaterial({ color: 0xd9d3c7, roughness: 0.9 });
          const face = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 });
          // BoxGeometry groups: +x, -x, +y, -y, +z (photo), -z (plain neutral back)
          board.add(new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.035), [plain, plain, plain, plain, face, plain]));
          const shadow = new THREE.Mesh(
            new THREE.PlaneGeometry(w * 1.3, 0.9),
            new THREE.MeshBasicMaterial({ map: makeShadowTexture(), transparent: true, depthWrite: false })
          );
          shadow.rotation.x = -Math.PI / 2;
          shadow.position.y = -h / 2 - 0.04;
          scene.add(shadow);
          setLoading(false);
        },
        undefined,
        () => !disposed && onFail("load")
      );

      const t0 = performance.now();
      return {
        tick() {
          const v = view.current;
          const L = LIGHTS[lightRef.current];
          key.color.setHex(L.color);
          key.intensity = L.intensity;
          scene.environmentIntensity = L.env;
          if (swayRef.current) {
            const t = (performance.now() - t0) / 1000;
            v.ty = Math.sin(t * 0.5) * YAW * 0.6;
            v.tp = Math.sin(t * 0.37) * PITCH * 0.5;
          }
          const k = reduce ? 1 : 0.12;
          v.yaw += (v.ty - v.yaw) * k;
          v.pitch += (v.tp - v.pitch) * k;
          v.z += (v.tz - v.z) * k;
          board.rotation.set(v.pitch, v.yaw, 0);
          camera.position.z = v.z;
        },
        dispose() {
          disposed = true;
        },
      };
    },
    [src]
  );

  // Non-passive wheel listener so the page doesn't scroll while zooming.
  useEffect(() => {
    const el = mountRef.current;
    const onWheel = (e) => {
      e.preventDefault();
      view.current.tz = clamp(view.current.tz * Math.exp(e.deltaY * 0.001), 2.4, 6);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const rotateBy = (dYaw, dPitch) => {
    const v = view.current;
    v.ty = clamp(v.ty + dYaw, -YAW, YAW);
    v.tp = clamp(v.tp + dPitch, -PITCH, PITCH);
  };
  const reset = () => {
    setSway(false);
    Object.assign(view.current, { ty: 0, tp: 0, tz: Z0 });
  };

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setSway(false);
  };
  const onPointerMove = (e) => {
    const map = pointers.current;
    const prev = map.get(e.pointerId);
    if (!prev) return;
    if (map.size === 1) {
      rotateBy((e.clientX - prev.x) * 0.006, (e.clientY - prev.y) * 0.004);
    } else if (map.size === 2) {
      const other = [...map.entries()].find(([id]) => id !== e.pointerId)[1];
      const before = Math.hypot(prev.x - other.x, prev.y - other.y);
      const after = Math.hypot(e.clientX - other.x, e.clientY - other.y);
      if (before > 0 && after > 0) view.current.tz = clamp(view.current.tz * (before / after), 2.4, 6);
    }
    map.set(e.pointerId, { x: e.clientX, y: e.clientY });
  };
  const onPointerUp = (e) => pointers.current.delete(e.pointerId);

  const onKeyDown = (e) => {
    const step = 0.12;
    const actions = {
      ArrowLeft: () => rotateBy(-step, 0),
      ArrowRight: () => rotateBy(step, 0),
      ArrowUp: () => rotateBy(0, -step),
      ArrowDown: () => rotateBy(0, step),
      "+": () => (view.current.tz = clamp(view.current.tz * 0.9, 2.4, 6)),
      "=": () => (view.current.tz = clamp(view.current.tz * 0.9, 2.4, 6)),
      "-": () => (view.current.tz = clamp(view.current.tz * 1.1, 2.4, 6)),
      Home: reset,
    };
    if (actions[e.key]) {
      e.preventDefault();
      setSway(false);
      actions[e.key]();
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-[var(--ink-main)]">{s.presentationLabel}</p>
      <div
        ref={mountRef}
        tabIndex={0}
        role="application"
        aria-label={`${s.presentationLabel}. ${s.dragHint}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        className={`relative w-full overflow-hidden rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-soft)] cursor-grab active:cursor-grabbing touch-none select-none focus-visible:outline-2 focus-visible:outline-[var(--accent-pine)] ${heightClass}`}
      >
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center text-xs text-[var(--ink-sub)]">
            {s.loading}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <button type="button" className={btn} onClick={reset}>
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{s.reset}</span>
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => setLight((l) => (l === "neutral" ? "warm" : "neutral"))}
        >
          {light === "neutral" ? (
            <Sun className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <SunDim className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          <span>{light === "neutral" ? s.lightNeutral : s.lightWarm}</span>
        </button>
        {!reduce && (
          <button type="button" className={btn} aria-pressed={sway} onClick={() => setSway((v) => !v)}>
            <Waves className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{s.sway}</span>
          </button>
        )}
        <span className="ms-auto text-[11px] text-[var(--ink-sub)]">{s.dragHint}</span>
      </div>
    </div>
  );
}

/** Mode 3 (model): a real GLB/GLTF of the product, framed by its bounding box. */
export function ModelStage3D({ url, lang, onFail, heightClass }) {
  const s = MEDIA_STRINGS[lang] || MEDIA_STRINGS.en;
  const reduce = prefersReducedMotion();
  const mountRef = useRef(null);
  const api = useRef(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const [loading, setLoading] = useState(true);
  const autoRef = useRef(false);
  autoRef.current = autoRotate && !reduce;

  useStage(
    mountRef,
    onFail,
    ({ scene, camera, canvas }) => {
      const controls = new OrbitControls(camera, canvas);
      controls.enableDamping = !reduce;
      controls.enablePan = false;
      controls.autoRotateSpeed = 1.5;
      const key = new THREE.DirectionalLight(0xffffff, 0.9);
      key.position.set(2.5, 4, 3);
      scene.add(key);
      let disposed = false;
      let dist = 3;
      setLoading(true);

      const setView = (name) => {
        const dir = { front: [0, 0, 1], back: [0, 0, -1], top: [0, 1, 0.0001] }[name];
        camera.position.set(...dir).normalize().multiplyScalar(dist);
        controls.target.set(0, 0, 0);
        controls.update();
      };
      api.current = { setView };

      new GLTFLoader().load(
        url,
        (gltf) => {
          const model = gltf.scene;
          if (disposed) return disposeObject(model);
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          model.position.sub(box.getCenter(new THREE.Vector3()));
          scene.add(model);
          const maxDim = Math.max(size.x, size.y, size.z) || 1;
          dist = (maxDim / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)))) * 1.5;
          camera.near = dist / 100;
          camera.far = dist * 100;
          camera.updateProjectionMatrix();
          controls.minDistance = dist * 0.4;
          controls.maxDistance = dist * 3;
          setView("front");
          setLoading(false);
        },
        undefined,
        () => !disposed && onFail("load")
      );

      return {
        tick() {
          controls.autoRotate = autoRef.current;
          controls.update();
        },
        dispose() {
          disposed = true;
          api.current = null;
          controls.dispose();
        },
      };
    },
    [url]
  );

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-[var(--ink-main)]">{s.accurateLabel}</p>
      <div
        ref={mountRef}
        className={`relative w-full overflow-hidden rounded-[4px] border border-[var(--border-subtle)] bg-[var(--bg-soft)] cursor-grab active:cursor-grabbing touch-none select-none ${heightClass}`}
      >
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center text-xs text-[var(--ink-sub)]">
            {s.loading}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {["front", "back", "top"].map((name) => (
          <button key={name} type="button" className={btn} onClick={() => api.current?.setView(name)}>
            {s[name]}
          </button>
        ))}
        {!reduce && (
          <button type="button" className={btn} aria-pressed={autoRotate} onClick={() => setAutoRotate((v) => !v)}>
            <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{s.autoRotate}</span>
          </button>
        )}
      </div>
    </div>
  );
}
