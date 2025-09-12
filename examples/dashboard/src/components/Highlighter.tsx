import { Container, ContainerProperties, readReactive, VanillaComponent, VanillaContainer } from '@react-three/uikit'
import { forwardRef, ForwardRefExoticComponent, PropsWithoutRef, RefAttributes, useRef } from 'react'
import { computed } from '@preact/signals-core'
import { Euler, Matrix4, Quaternion, Vector3 } from 'three'

const matrixHelper = new Matrix4()
const quaternionHelper = new Quaternion()

/**
 * must be placed inside the root component of the ui
 */
export const Highlighter: ForwardRefExoticComponent<
  PropsWithoutRef<ContainerProperties> & RefAttributes<VanillaContainer>
> = forwardRef<VanillaContainer, ContainerProperties>(({ onPointerOver, onPointerLeave, children, ...props }, ref) => {
  const highlightRef = useRef<VanillaContainer | null>(null)
  //adding width and height 100% to the highligher container to make sure its filling its parent which is required for the highligher to work
  return (
    <Container
      ref={ref}
      width="100%"
      height="100%"
      {...props}
      onPointerOver={(e) => {
        if (!(e.object instanceof VanillaComponent) || highlightRef.current == null) {
          return
        }
        const { globalMatrix, properties, size } = e.object as VanillaContainer
        const transformation = computed(() => {
          const { value } = globalMatrix
          if (value == null) {
            return { translation: new Vector3(), scale: new Vector3(), rotation: new Euler() }
          }
          matrixHelper.copy(value)
          const translation = new Vector3()
          const scale = new Vector3()
          matrixHelper.decompose(translation, quaternionHelper, scale)
          const rotation = new Euler().setFromQuaternion(quaternionHelper)
          return { translation, scale, rotation }
        })
        const width = computed(() => transformation.value.scale.x * (size.value?.[0] ?? 0))
        const height = computed(() => transformation.value.scale.y * (size.value?.[1] ?? 0) * 1)
        highlightRef.current.setProperties({
          visibility: 'visible',
          transformTranslateX: computed(
            () => transformation.value.translation.x / properties.value.pixelSize - 0.5 * width.value,
          ),
          transformTranslateY: computed(
            () => -transformation.value.translation.y / properties.value.pixelSize - 0.5 * height.value,
          ),
          transformTranslateZ: computed(() => transformation.value.translation.z / properties.value.pixelSize),

          transformScaleZ: computed(() => transformation.value.scale.z),
          transformRotateX: computed(() => transformation.value.rotation.x),
          transformRotateZ: computed(() => transformation.value.rotation.y),
          transformRotateY: computed(() => transformation.value.rotation.z),
          width,
          height,
        })
        readReactive(onPointerOver)?.(e)
      }}
      onPointerLeave={(e) => {
        highlightRef.current?.setProperties({ visibility: 'hidden' })
        readReactive(onPointerLeave)?.(e)
      }}
      onClick={(e) => {
        if (!(e.object instanceof VanillaComponent)) {
          return
        }
        console.log(e.object)
      }}
    >
      {children}
      <Container
        ref={highlightRef}
        pointerEvents="none"
        positionType="absolute"
        positionLeft="50%"
        positionTop="50%"
        zIndex={20}
        borderColor="red"
        borderWidth={1}
      />
    </Container>
  )
})
