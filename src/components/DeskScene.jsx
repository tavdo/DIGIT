import { useEffect, useRef } from "react";
import * as THREE from "three";

function DeskScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor("#100e0c", 1);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog("#100e0c", 7.5, 16);

    const camera = new THREE.PerspectiveCamera(
      30,
      mount.clientWidth / Math.max(mount.clientHeight, 1),
      0.1,
      40,
    );
    camera.position.set(-0.2, 0.05, 8.2);

    const photoGeo = new THREE.PlaneGeometry(11.5, 6.6, 1, 1);
    const photoMat = new THREE.MeshStandardMaterial({
      color: "#2a241e",
      roughness: 0.9,
      metalness: 0,
    });
    const photo = new THREE.Mesh(photoGeo, photoMat);
    photo.position.set(0.4, 0, -1.2);
    scene.add(photo);

    const loader = new THREE.TextureLoader();
    loader.load("/hero-bg.jpg", (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      photoMat.map = texture;
      photoMat.color.set("#ffffff");
      photoMat.needsUpdate = true;
      if (reduced) renderer.render(scene, camera);
    });

    const slipGeo = new THREE.PlaneGeometry(1.15, 0.16);
    const slips = [];
    for (let i = 0; i < 7; i += 1) {
      const slip = new THREE.Mesh(
        slipGeo,
        new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? "#f4efe6" : "#ff5a45",
          transparent: true,
          opacity: 0.28,
        }),
      );
      slip.position.set(-4.2 + i * 1.35, -1.6 + (i % 3) * 0.9, 0.4);
      slip.rotation.z = -0.08 + (i % 3) * 0.05;
      scene.add(slip);
      slips.push({
        mesh: slip,
        speed: 0.22 + (i % 3) * 0.06,
        baseY: slip.position.y,
      });
    }

    scene.add(new THREE.AmbientLight("#f3ece2", 0.35));
    const lamp = new THREE.SpotLight("#ffd7b0", 40, 18, 0.42, 0.65, 1);
    lamp.position.set(0, 2.2, 4);
    lamp.target.position.set(0.6, 0, -1);
    scene.add(lamp);
    scene.add(lamp.target);

    const pointer = { x: 0, y: 0 };
    const onMove = (event) => {
      const rect = mount.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);

    const clock = new THREE.Clock();
    let frameId = 0;

    const renderFrame = () => {
      const time = clock.getElapsedTime();
      photo.position.x = 0.4 + pointer.x * 0.18;
      photo.position.y = pointer.y * -0.08;

      lamp.target.position.x = Math.sin(time * 0.25) * 1.6 + pointer.x * 0.8;
      lamp.target.position.y = Math.cos(time * 0.18) * 0.4 + pointer.y * -0.3;
      lamp.target.updateMatrixWorld();

      slips.forEach(({ mesh, speed, baseY }) => {
        mesh.position.x += speed * 0.01;
        mesh.position.y = baseY + Math.sin(time * 0.6 + mesh.position.x) * 0.08;
        if (mesh.position.x > 6) mesh.position.x = -6;
      });

      const scroll = window.scrollY || 0;
      const targetX = pointer.x * 0.35 - 0.2;
      const targetY = pointer.y * -0.18 + 0.05 - scroll * 0.0011;
      camera.position.x += (targetX - camera.position.x) * 0.04;
      camera.position.y += (targetY - camera.position.y) * 0.04;
      camera.lookAt(0.85, -scroll * 0.00035, 0);
      renderer.render(scene, camera);
    };

    const loop = () => {
      renderFrame();
      frameId = requestAnimationFrame(loop);
    };

    if (reduced) {
      renderFrame();
    } else {
      loop();
    }

    const onResize = () => {
      const width = mount.clientWidth;
      const height = Math.max(mount.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      if (reduced) renderFrame();
    };
    const observer = new ResizeObserver(onResize);
    observer.observe(mount);

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
      photoGeo.dispose();
      photoMat.map?.dispose();
      photoMat.dispose();
      slipGeo.dispose();
      slips.forEach(({ mesh }) => mesh.material.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div className="site-bg" ref={mountRef} aria-hidden="true" />;
}

export default DeskScene;
