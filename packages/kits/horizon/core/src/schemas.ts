import { AvatarPropertiesSchema } from './avatar/index.js'
import { BadgePropertiesSchema } from './badge/index.js'
import { ButtonIconPropertiesSchema } from './button/icon.js'
import { ButtonPropertiesSchema } from './button/index.js'
import { ButtonLabelPropertiesSchema } from './button/label.js'
import { ButtonLabelSubtextPropertiesSchema } from './button/label-subtext.js'
import { CheckboxPropertiesSchema } from './checkbox/index.js'
import { DividerPropertiesSchema } from './divider/index.js'
import { DropdownAvatarPropertiesSchema } from './dropdown/avatar.js'
import { DropdownButtonPropertiesSchema } from './dropdown/button.js'
import { DropdownIconPropertiesSchema } from './dropdown/icon.js'
import { DropdownPropertiesSchema } from './dropdown/index.js'
import { DropdownListPropertiesSchema } from './dropdown/list.js'
import { DropdownListItemPropertiesSchema } from './dropdown/list-item.js'
import { DropdownTextValuePropertiesSchema } from './dropdown/text-value.js'
import { IconIndicatorPropertiesSchema } from './icon-indicator/index.js'
import { InputPropertiesSchema as HorizonInputPropertiesSchema } from './input/index.js'
import { InputFieldPropertiesSchema } from './input-field/index.js'
import { PanelPropertiesSchema } from './panel/index.js'
import { ProgressBarPropertiesSchema } from './progress-bar/index.js'
import { ProgressBarStepperPropertiesSchema } from './progress-bar/stepper.js'
import { ProgressBarStepperStepPropertiesSchema } from './progress-bar/stepper-step.js'
import { RadioGroupPropertiesSchema } from './radio-group/index.js'
import { RadioGroupItemPropertiesSchema } from './radio-group/item.js'
import { SliderPropertiesSchema } from './slider/index.js'
import { TogglePropertiesSchema } from './toggle/index.js'

type PropertySchema = { safeParse: (value: unknown) => unknown }

export type ComponentSchemaName =
  | 'Avatar'
  | 'Badge'
  | 'Button'
  | 'ButtonIcon'
  | 'ButtonLabel'
  | 'ButtonLabelSubtext'
  | 'Checkbox'
  | 'Divider'
  | 'Dropdown'
  | 'DropdownAvatar'
  | 'DropdownButton'
  | 'DropdownIcon'
  | 'DropdownList'
  | 'DropdownListItem'
  | 'DropdownTextValue'
  | 'IconIndicator'
  | 'Input'
  | 'InputField'
  | 'Panel'
  | 'ProgressBar'
  | 'ProgressBarStepper'
  | 'ProgressBarStepperStep'
  | 'RadioGroup'
  | 'RadioGroupItem'
  | 'Slider'
  | 'Toggle'

export const ComponentPropertiesSchemas: Record<ComponentSchemaName, PropertySchema> = /* @__PURE__ */ (() => ({
  Avatar: AvatarPropertiesSchema,
  Badge: BadgePropertiesSchema,
  Button: ButtonPropertiesSchema,
  ButtonIcon: ButtonIconPropertiesSchema,
  ButtonLabel: ButtonLabelPropertiesSchema,
  ButtonLabelSubtext: ButtonLabelSubtextPropertiesSchema,
  Checkbox: CheckboxPropertiesSchema,
  Divider: DividerPropertiesSchema,
  Dropdown: DropdownPropertiesSchema,
  DropdownAvatar: DropdownAvatarPropertiesSchema,
  DropdownButton: DropdownButtonPropertiesSchema,
  DropdownIcon: DropdownIconPropertiesSchema,
  DropdownList: DropdownListPropertiesSchema,
  DropdownListItem: DropdownListItemPropertiesSchema,
  DropdownTextValue: DropdownTextValuePropertiesSchema,
  IconIndicator: IconIndicatorPropertiesSchema,
  Input: HorizonInputPropertiesSchema,
  InputField: InputFieldPropertiesSchema,
  Panel: PanelPropertiesSchema,
  ProgressBar: ProgressBarPropertiesSchema,
  ProgressBarStepper: ProgressBarStepperPropertiesSchema,
  ProgressBarStepperStep: ProgressBarStepperStepPropertiesSchema,
  RadioGroup: RadioGroupPropertiesSchema,
  RadioGroupItem: RadioGroupItemPropertiesSchema,
  Slider: SliderPropertiesSchema,
  Toggle: TogglePropertiesSchema,
}))()

export const componentSchemas = ComponentPropertiesSchemas
