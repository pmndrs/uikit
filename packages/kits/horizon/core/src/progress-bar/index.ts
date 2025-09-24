import { BaseOutProperties, Container, InProperties, RenderContext } from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { theme } from '../theme.js'

export type ProgressBarOutProperties = BaseOutProperties & {
  value?: number
}

export class ProgressBar extends Container<ProgressBarOutProperties> {
  public readonly fill: Container
  constructor(
    inputProperties?: InProperties<ProgressBarOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<ProgressBarOutProperties>
    },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        borderRadius: 1000,
        height: 12,
        backgroundColor: theme.component.progressBar.determinate.background.background.value,
        ...config?.defaultOverrides,
      },
    })
    super.add(
      (this.fill = new Container(undefined, undefined, {
        defaultOverrides: {
          height: 12,
          borderRadius: 1000,
          backgroundColor: theme.component.progressBar.determinate.fill.fill.value,
          width: computed(() => `${this.properties.value.value ?? 0}%` as const),
          minWidth: 12,
        },
      })),
    )
  }

  dispose(): void {
    this.fill.dispose()
    super.dispose()
  }

  add(): this {
    throw new Error(`the ProgressBar component can not have any children`)
  }
}

export * from './stepper.js'
export * from './stepper-step.js'
