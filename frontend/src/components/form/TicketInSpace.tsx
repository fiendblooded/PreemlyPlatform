import { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Text } from "@react-three/drei";
import { BufferGeometry, Mesh } from "three";

type EventDetails = { name: string; event: string };
const Ticket = (details: EventDetails) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  return (
    <mesh
      ref={meshRef as unknown as React.RefObject<Mesh<BufferGeometry>>}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={[6, 6, 1]} // Consistent scaling
    >
      {/* Ticket geometry */}
      <planeGeometry args={[2, 1]} />
      <meshBasicMaterial color={hovered ? "lightblue" : "white"} />

      {/* 3D text for ticket details */}
      <Text
        position={[0, 0.3, 0.01]} // Position text above the center
        fontSize={0.15}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {details.name}
      </Text>
      <Text
        position={[0, -0.1, 0.01]} // Position text below the title
        fontSize={0.12}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {details.event}
      </Text>
    </mesh>
  );
};

// The TicketInSpace component now accepts ticketDetails as a prop
const TicketInSpace = (ticketDetails: EventDetails) => {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Canvas>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Ticket name={ticketDetails.name} event={ticketDetails.event} />
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default TicketInSpace;
