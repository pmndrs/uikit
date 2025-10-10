import { Container } from '@react-three/uikit'
import { ProgressBar, ProgressBarStepper, ProgressBarStepperStep } from '@react-three/uikit-horizon'

export function ProgressDemo() {
  return (
    <Container gap={16} alignItems="center">
      <ProgressBar width={240} value={66} />
      <ProgressBarStepper width={300}>
        <ProgressBarStepperStep value />
        <ProgressBarStepperStep />
        <ProgressBarStepperStep />
        <ProgressBarStepperStep />
      </ProgressBarStepper>
    </Container>
  )
}


