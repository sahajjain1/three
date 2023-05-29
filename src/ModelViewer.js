import React, { useEffect, useRef, useState } from 'react';
import { Canvas, extend, useFrame, useThree } from 'react-three-fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import './ModelViewer.css'

extend({ OrbitControls });

const ModelViewer = () => {
  const modelRef = useRef();
  const controlsRef = useRef();

  const { camera, gl } = useThree();

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(
      process.env.PUBLIC_URL + '/ImageToStl.com_innova4.glb',
      (gltf) => {
        const model = gltf.scene;
        model.position.set(0, 0, 0);
        model.scale.set(0.019, 0.019, 0.019); // Adjust the scale of the model to make it smaller
        model.rotation.x = -Math.PI / 2;
        model.rotation.y = Math.PI;
        model.rotation.z = Math.PI;
        modelRef.current.add(model);
      },
      undefined,
      (error) => {
        console.error('Error loading 3D model', error);
      }
    );
  }, []);

  useFrame(() => {
    controlsRef.current.update();
  });

  return (
    <group ref={modelRef}>
      <orbitControls ref={controlsRef} args={[camera, gl.domElement]} enableDamping dampingFactor={0.1} rotateSpeed={0.5} />
    </group>
  );
};

const ThreeScene = () => {
  const sceneRef = useRef(null);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);
  const soundRef = useRef(null);

  useEffect(() => {
    let scene, camera, renderer, cloudParticles = [], flash, rain, rainGeo, rainCount = 15000;

    const init = () => {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
      camera.position.z = 1;
      camera.rotation.x = 1.16;
      camera.rotation.y = -0.12;
      camera.rotation.z = 0.27;

      const ambient = new THREE.AmbientLight(0x555555);
      scene.add(ambient);

      const directionalLight = new THREE.DirectionalLight(0xffeedd);
      directionalLight.position.set(0, 0, 1);
      scene.add(directionalLight);

      flash = new THREE.PointLight(0x062d89, 30, 500, 1.7);
      flash.position.set(200, 300, 100);
      scene.add(flash);

      renderer = new THREE.WebGLRenderer();
      renderer.setClearColor(0xcce0ff); // Set background color to light blue
      renderer.setSize(window.innerWidth, window.innerHeight);
      sceneRef.current.appendChild(renderer.domElement);

      rainGeo = new THREE.BufferGeometry();
      const positions = [];
      const velocities = [];
      for (let i = 0; i < rainCount; i++) {
        positions.push(
          Math.random() * 400 - 200,
          Math.random() * 500 - 250,
          Math.random() * 400 - 200
        );
        velocities.push(0);
      }
      rainGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      rainGeo.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 1));

      const rainMaterial = new THREE.PointsMaterial({
        color: 0xadd8e6, // Light blue color
        size: 0.1,
        transparent: true,
      });
      rain = new THREE.Points(rainGeo, rainMaterial);
      scene.add(rain);

      const loader = new THREE.TextureLoader();
      loader.load(process.env.PUBLIC_URL + '/smoke.png', function (texture) {
        const cloudGeo = new THREE.PlaneGeometry(500, 500);
        const cloudMaterial = new THREE.MeshLambertMaterial({
          map: texture,
          transparent: true,
        });

        for (let p = 0; p < 25; p++) {
          const cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
          cloud.position.set(
            Math.random() * 800 - 400,
            500,
            Math.random() * 500 - 450
          );
          cloud.rotation.x = 1.16;
          cloud.rotation.y = -0.12;
          cloud.rotation.z = Math.random() * 360;
          cloud.material.opacity = 0.6;
          cloudParticles.push(cloud);
          scene.add(cloud);
        }

        animate();
      });
    };

    const animate = () => {
      cloudParticles.forEach((p) => {
        p.rotation.z -= 0.002;
      });

      const positions = rainGeo.getAttribute('position');
      const velocities = rainGeo.getAttribute('velocity');

      for (let i = 0; i < positions.array.length; i += 3) {
        velocities.array[i / 3] -= 0.1 + Math.random() * 0.1;
        positions.array[i + 1] += velocities.array[i / 3];

        if (positions.array[i + 1] < -200) {
          positions.array[i + 1] = 200;
          velocities.array[i / 3] = 0;
        }
      }

      positions.needsUpdate = true;
      velocities.needsUpdate = true;

      rain.rotation.y += 0.002;

      if (Math.random() > 0.93 || flash.power > 100) {
        if (flash.power < 100)
          flash.position.set(
            Math.random() * 400,
            300 + Math.random() * 200,
            100
          );
        flash.power = 50 + Math.random() * 500;
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    init();

    // Cleanup
    return () => {
      if (sceneRef.current && sceneRef.current.removeChild) {
        sceneRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  const toggleSound = () => {
    setIsSoundPlaying(!isSoundPlaying);
    if (isSoundPlaying) {
      soundRef.current.pause();
    } else {
      soundRef.current.play();
    }
  };

  return (
    <div>
      <div ref={sceneRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: -1 }} />
      <audio ref={soundRef} src={process.env.PUBLIC_URL + '/rain.mp3'} volume="0.1" loop />
      <input type="checkbox" id="checkboxInput" />
      <label htmlFor="checkboxInput" className="toggleSwitch" onClick={toggleSound}>
        <div className="mute-speaker">
          <svg xmlns="http://www.w3.org/2000/svg" version="1.0" viewBox="0 0 75 75">
            <path
              d="M39.389,13.769 L22.235,28.606 L6,28.606 L6,47.699 L21.989,47.699 L39.389,62.75 L39.389,13.769z"
              style={{ stroke: '#fff', strokeWidth: 5, strokeLinejoin: 'round', fill: '#fff' }}
            ></path>
            <path
              d="M48,27.6a19.5,19.5 0 0 1 0,21.4M55.1,20.5a30,30 0 0 1 0,35.6M61.6,14a38.8,38.8 0 0 1 0,48.6"
              style={{ fill: 'none', stroke: '#fff', strokeWidth: 5, strokeLinecap: 'round' }}
            ></path>
          </svg>
        </div>
        <div className="speaker">
          <svg version="1.0" viewBox="0 0 75 75" stroke="#fff" strokeWidth="5">
            <path
              d="m39,14-17,15H6V48H22l17,15z"
              fill="#fff"
              strokeLinejoin="round"
            ></path>
            <path d="m49,26 20,24m0-24-20,24" fill="#fff" strokeLinecap="round"></path>
          </svg>
        </div>
      </label>
      <div

        style={{
          position: 'absolute',
          bottom: '30%',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'Arial, sans-serif',
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#333333',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
        }}
      >
        Celebrating 25 years of success!!
      </div>

      <Canvas style={{ width: '100vw', height: '100vh' }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <ModelViewer />
      </Canvas>
    </div>
  );
};

export default ThreeScene;
