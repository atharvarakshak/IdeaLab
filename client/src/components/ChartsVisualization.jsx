import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const ChartsVisualization = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/charts")
      .then((response) => response.json())
      .then((result) => setData(result.market_analysis))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  if (!data) return <p>Loading...</p>;

  const { market_overview, competitive_landscape, regional_analysis } = data;

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [0, 5, 10] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls />

        {/* Bar Chart for Market Segments */}
        {market_overview.market_segments.map((segment, index) => (
          <mesh
            key={index}
            position={[index * 2, segment.segment_size / 10, 0]}
          >
            <boxGeometry args={[1, segment.segment_size / 5, 1]} />
            <meshStandardMaterial
              color={new THREE.Color(`hsl(${index * 60}, 100%, 50%)`)}
            />
          </mesh>
        ))}

        {/* Pie Chart for Competitor Market Share */}
        {competitive_landscape.market_share_distribution.map(
          (competitor, index) => {
            const angle = (competitor.market_share / 100) * Math.PI * 2;
            return (
              <mesh key={index} rotation={[0, angle, 0]} position={[5, 0, 0]}>
                <cylinderGeometry args={[3, 3, 0.5, 32, 1, false, 0, angle]} />
                <meshStandardMaterial
                  color={new THREE.Color(`hsl(${index * 80}, 100%, 50%)`)}
                />
              </mesh>
            );
          }
        )}
      </Canvas>
    </div>
  );
};

export default ChartsVisualization;
