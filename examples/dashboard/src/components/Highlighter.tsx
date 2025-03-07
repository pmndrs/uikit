import { Container, ContainerProperties, ContainerRef, isInteractionPanel } from '@react-three/uikit'
import { forwardRef, useRef } from 'react'
import { computed } from '@preact/signals-core'
import { Euler, Matrix4, Quaternion, Vector3 } from 'three'

const matrixHelper = new Matrix4()
const quaternionHelper = new Quaternion()

export const Highlighter = forwardRef<ContainerRef, ContainerProperties>(
  ({ onPointerOver, onPointerLeave, children, ...props }, ref) => {
    const highlightRef = useRef<ContainerRef | null>(null)
    return (
      <Container
        ref={ref}
        {...props}
        onPointerOver={(e) => {
          if (!isInteractionPanel(e.object) || highlightRef.current == null) {
            return
          }
          const {
            internals: { globalMatrix, root, size },
          } = e.object
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
          highlightRef.current.setStyle({
            visibility: 'visible',
            transformTranslateX: computed(
              () => transformation.value.translation.x / root.pixelSize.value - 0.5 * width.value,
            ),
            transformTranslateY: computed(
              () => -transformation.value.translation.y / root.pixelSize.value - 0.5 * height.value,
            ),
            transformTranslateZ: computed(() => transformation.value.translation.z / root.pixelSize.value),

            transformScaleZ: computed(() => transformation.value.scale.z),
            transformRotateX: computed(() => transformation.value.rotation.x),
            transformRotateZ: computed(() => transformation.value.rotation.y),
            transformRotateY: computed(() => transformation.value.rotation.z),
            width,
            height,
          })
          onPointerOver?.(e)
        }}
        onPointerLeave={(e) => {
          highlightRef.current?.setStyle({ visibility: 'hidden' })

          onPointerLeave?.(e)
        }}
      >
        {children}
        <Container
          ref={highlightRef}
          pointerEvents="none"
          positionType="absolute"
          positionLeft="50%"
          positionTop="50%"
          zIndexOffset={20}
          borderColor="red"
          borderWidth={1}
        />
      </Container>
    )
  },
)
