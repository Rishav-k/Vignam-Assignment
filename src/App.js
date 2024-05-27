import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, TransformControls, useAnimations } from '@react-three/drei';
import './App.css'; 


// Component to load and render the GLTF model

function Model({ path, onObjectClick, setAnimations }) {
  const { scene, animations } = useGLTF(path);
  const { ref, actions, names } = useAnimations(animations, scene);

  console.log(animations);
  console.log(names);

  useEffect(() => {
    if (setAnimations) {
      setAnimations(names, actions);
    }
  }, [names, actions, scene, setAnimations]);

  const handleClick = (event) => {
    console.log("clicked");
    event.stopPropagation();
    onObjectClick(event.object);
    console.log(event.object);
  };

  return <primitive ref={ref} position={[0 ,-5 ,15]} object={scene} onClick={handleClick} />;
}


function Scene({ enableRotation, enableSlicing, transformMode, onObjectClick, selectedObject, setAnimations, setInitialPositions }) {
  const orbitControlsRef = useRef();
  const transformControlsRef = useRef();

  useEffect(() => {
    if (transformControlsRef.current && selectedObject) {
      transformControlsRef.current.attach(selectedObject);
    }
  }, [selectedObject]);


  useEffect(() => {
    if (transformControlsRef.current) {
      const controls = transformControlsRef.current;
      const handleMouseUp = () => {
        if (selectedObject) {
          selectedObject.updateMatrixWorld();
        }
      };
      controls.addEventListener('mouseUp', handleMouseUp);
      return () => {
        controls.removeEventListener('mouseUp', handleMouseUp);
      };
    }
  }, [selectedObject]);

  return (
    <>
      <Model path="./Reflexarc/Reflex arc/reflexarc.gltf" onObjectClick={onObjectClick} setAnimations={setAnimations}  />
      {enableRotation && <OrbitControls ref={orbitControlsRef} minDistance={40} target = {[0,0,10]} />}
      {enableSlicing && selectedObject && (
        <TransformControls
          ref={transformControlsRef}
          mode={transformMode}
          onPointerDown={(e) => e.stopPropagation()}
        />
      )}
    </>
  );
}

function App() {
  const [selectedObject, setSelectedObject] = useState(null);
  const [animations, setAnimations] = useState([]);
  const [actions, setActions] = useState({});
  const [currentAction, setCurrentAction] = useState(null);
  const [showAnimations, setShowAnimations] = useState(false)
  const [enableRotation, setEnableRotation] = useState(true);
  const [enableSlicing, setEnableSlicing] = useState(false);
  const [transformMode, setTransformMode] = useState('translate');

  const handleObjectClick = (object) => {
    setSelectedObject(object);
    console.log(`Selected object: ${object.name}`);
  };

  const playAnimation = (animationName) => {
    if (currentAction) {
      currentAction.stop();
    }
    const action = actions[animationName];
    if (action) {
      action.play();
      setCurrentAction(action);
    }
  };

  const handleAnimationButtonClick = () => {
    console.log("handle animation clicked")
    setShowAnimations(!showAnimations);
  };

  const handleRotationButtonClick = () => {
    setEnableRotation(true);
    setEnableSlicing(false);
  };

  const handleSlicingButtonClick = () => {
    setEnableRotation(false);
    setEnableSlicing(true);
  };

  const handleTransformModeChange = (mode) => {
    setTransformMode(mode);
  };
  console.log(enableSlicing)
  console.log(enableRotation)

  return (
    <>
      

      <div className = "control-box">
      
        <button className={`btn ${enableRotation ? 'btn-active' : ''}`} onClick={handleRotationButtonClick}>Enable Rotation</button>
        <button className={`btn ${enableSlicing ? 'btn-active' : ''}`} onClick={handleSlicingButtonClick}>Enable Slicing</button>
        <button className={`btn`} onClick={handleAnimationButtonClick}>
          {showAnimations ? 'Hide Animations' : 'Show Animations'}
        </button>
        {enableSlicing && (
          <div className = "slice-btn" >
            <button className={`btn ${transformMode === 'translate' ? 'btn-active' : ''}`} onClick={() => handleTransformModeChange('translate')}>Translate</button>
            <button className={`btn ${transformMode === 'rotate' ? 'btn-active' : ''}`} onClick={() => handleTransformModeChange('rotate')}>Rotate</button>
            <button className={`btn ${transformMode === 'scale' ? 'btn-active' : ''}`} onClick={() => handleTransformModeChange('scale')}>Scale</button>
          </div>
        )}
        <h2>SCIENCE TUTORIALS</h2>
        <hr></hr>
        {showAnimations && animations.length > 0 && (
          <div className = "anime-btn">
            <center><h3>Animations</h3></center>
            {animations.map((anim, index) => (
              <button
                key={index}
                className={`btn ${currentAction && currentAction._clip.name === anim ? 'btn-active' : ''}`}
                onClick={() => playAnimation(anim)}
              >
                {anim}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className = "canvas-position">
      <Canvas shadows
                camera={{ position: [100, 30, 10], fov: 20 }} style={{ height: '100vh', width: '100vw' }} S>
        <ambientLight intensity={3} /> 
    <directionalLight position={[-100, -100, -100]} intensity={2} color="#ffe8c5" /> 
    <directionalLight position={[100, 100, 20]} intensity={1} color="#c5eaff" />
        <Scene
          enableRotation={enableRotation}
          enableSlicing={enableSlicing}
          transformMode={transformMode}
          onObjectClick={handleObjectClick}
          selectedObject={selectedObject}
          setAnimations={(names, actions) => {
            setAnimations(names);
            setActions(actions);
          }}
        />
      </Canvas>
      </div>
    </>
  );
}

export default App;
