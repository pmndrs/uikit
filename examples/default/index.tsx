import { StrictMode } from "react";
import { Canvas } from "@react-three/fiber";
import { createRoot } from "react-dom/client";
import { DefaultProperties, Fullscreen, Text, Container } from "@react-three/uikit";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/accordion.js";
import { Terminal } from "@react-three/uikit-lucide";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

function App() {
  return (
    <Canvas style={{ height: "100dvh", touchAction: "none" }} gl={{ localClippingEnabled: true }}>
      <color attach="background" args={["black"]} />
      <ambientLight intensity={0.5} />
      <directionalLight intensity={0} position={[5, 1, 10]} />
      <Fullscreen
        scrollbarColor="black"
        backgroundColor="white"
        alignItems="center"
        justifyContent="center"
        padding={32}
      >
        <Container width="100%" maxWidth={500}>
          <DefaultProperties color="black" borderColor="#e5e7eb">
            <AccordionDemo />
          </DefaultProperties>
        </Container>
      </Fullscreen>
    </Canvas>
  );
}

/*export function AlertDemo() {
  return (
    <Alert>
      <Terminal width={16} height={16} />
      <AlertTitle>
        <Text>Heads up!</Text>
      </AlertTitle>
      <AlertDescription>
        <Text>You can add components to your app using the cli.</Text>
      </AlertDescription>
    </Alert>
  );
}*/

//TODO: type="single" collapsible
export default function AccordionDemo() {
  return (
    <Accordion>
      <AccordionItem value="item-1">
        <AccordionTrigger>
          <Text>Is it accessible?</Text>
        </AccordionTrigger>
        <AccordionContent>
          <Text>Yes. It adheres to the WAI-ARIA design pattern.</Text>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>
          <Text>Is it styled?</Text>
        </AccordionTrigger>
        <AccordionContent>
          <Text>
            Yes. It comes with default styles that matches the other components&apos; aesthetic.
          </Text>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>
          <Text>Is it animated?</Text>
        </AccordionTrigger>
        <AccordionContent>
          <Text>Yes. It&apos;s animated by default, but you can disable it if you prefer.</Text>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
