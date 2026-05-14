import { AccordionPropertiesSchema } from './accordion/index.js'
import { AccordionContentPropertiesSchema } from './accordion/content.js'
import { AccordionItemPropertiesSchema } from './accordion/item.js'
import { AccordionTriggerPropertiesSchema } from './accordion/trigger.js'
import { AccordionTriggerIconPropertiesSchema } from './accordion/trigger-icon.js'
import { AlertDescriptionPropertiesSchema } from './alert/description.js'
import { AlertIconPropertiesSchema } from './alert/icon.js'
import { AlertPropertiesSchema } from './alert/index.js'
import { AlertTitlePropertiesSchema } from './alert/title.js'
import { AlertDialogActionPropertiesSchema } from './alert-dialog/action.js'
import { AlertDialogCancelPropertiesSchema } from './alert-dialog/cancel.js'
import { AlertDialogContentPropertiesSchema } from './alert-dialog/content.js'
import { AlertDialogDescriptionPropertiesSchema } from './alert-dialog/description.js'
import { AlertDialogFooterPropertiesSchema } from './alert-dialog/footer.js'
import { AlertDialogHeaderPropertiesSchema } from './alert-dialog/header.js'
import { AlertDialogPropertiesSchema } from './alert-dialog/index.js'
import { AlertDialogTitlePropertiesSchema } from './alert-dialog/title.js'
import { AlertDialogTriggerPropertiesSchema } from './alert-dialog/trigger.js'
import { AvatarPropertiesSchema } from './avatar/index.js'
import { BadgePropertiesSchema } from './badge/index.js'
import { ButtonPropertiesSchema } from './button/index.js'
import { CardPropertiesSchema } from './card/index.js'
import { CardContentPropertiesSchema } from './card/content.js'
import { CardDescriptionPropertiesSchema } from './card/description.js'
import { CardFooterPropertiesSchema } from './card/footer.js'
import { CardHeaderPropertiesSchema } from './card/header.js'
import { CardTitlePropertiesSchema } from './card/title.js'
import { CheckboxPropertiesSchema } from './checkbox/index.js'
import { DialogContentPropertiesSchema } from './dialog/content.js'
import { DialogDescriptionPropertiesSchema } from './dialog/description.js'
import { DialogFooterPropertiesSchema } from './dialog/footer.js'
import { DialogHeaderPropertiesSchema } from './dialog/header.js'
import { DialogPropertiesSchema } from './dialog/index.js'
import { DialogTitlePropertiesSchema } from './dialog/title.js'
import { DialogTriggerPropertiesSchema } from './dialog/trigger.js'
import { InputPropertiesSchema as DefaultInputPropertiesSchema } from './input/index.js'
import { LabelPropertiesSchema } from './label/index.js'
import { MenubarPropertiesSchema } from './menubar/index.js'
import { MenubarMenuPropertiesSchema } from './menubar/menu.js'
import { MenubarTriggerPropertiesSchema } from './menubar/trigger.js'
import { PaginationPropertiesSchema } from './pagination/index.js'
import { PaginationContentPropertiesSchema } from './pagination/content.js'
import { PaginationEllipsisPropertiesSchema } from './pagination/ellipsis.js'
import { PaginationItemPropertiesSchema } from './pagination/item.js'
import { PaginationLinkPropertiesSchema } from './pagination/link.js'
import { PaginationNextPropertiesSchema } from './pagination/next.js'
import { PaginationPreviousPropertiesSchema } from './pagination/previous.js'
import { ProgressPropertiesSchema } from './progress/index.js'
import { RadioGroupPropertiesSchema } from './radio-group/index.js'
import { RadioGroupItemPropertiesSchema } from './radio-group/item.js'
import { SeparatorPropertiesSchema } from './separator/index.js'
import { SkeletonPropertiesSchema } from './skeleton/index.js'
import { SliderPropertiesSchema } from './slider/index.js'
import { SwitchPropertiesSchema } from './switch/index.js'
import { TabsPropertiesSchema } from './tabs/index.js'
import { TabsContentPropertiesSchema } from './tabs/content.js'
import { TabsListPropertiesSchema } from './tabs/list.js'
import { TabsTriggerPropertiesSchema } from './tabs/trigger.js'
import { TextareaPropertiesSchema as DefaultTextareaPropertiesSchema } from './textarea/index.js'
import { TogglePropertiesSchema } from './toggle/index.js'
import { ToggleGroupPropertiesSchema } from './toggle-group/index.js'
import { ToggleGroupItemPropertiesSchema } from './toggle-group/item.js'
import { TooltipPropertiesSchema } from './tooltip/index.js'
import { TooltipContentPropertiesSchema } from './tooltip/content.js'
import { TooltipTriggerPropertiesSchema } from './tooltip/trigger.js'
import { VideoControlsPropertiesSchema, VideoPropertiesSchema as DefaultVideoPropertiesSchema } from './video/index.js'

type PropertySchema = { safeParse: (value: unknown) => unknown }

export type ComponentSchemaName =
  | 'Accordion'
  | 'AccordionContent'
  | 'AccordionItem'
  | 'AccordionTrigger'
  | 'AccordionTriggerIcon'
  | 'Alert'
  | 'AlertDescription'
  | 'AlertIcon'
  | 'AlertTitle'
  | 'AlertDialog'
  | 'AlertDialogAction'
  | 'AlertDialogCancel'
  | 'AlertDialogContent'
  | 'AlertDialogDescription'
  | 'AlertDialogFooter'
  | 'AlertDialogHeader'
  | 'AlertDialogTitle'
  | 'AlertDialogTrigger'
  | 'Avatar'
  | 'Badge'
  | 'Button'
  | 'Card'
  | 'CardContent'
  | 'CardDescription'
  | 'CardFooter'
  | 'CardHeader'
  | 'CardTitle'
  | 'Checkbox'
  | 'Dialog'
  | 'DialogContent'
  | 'DialogDescription'
  | 'DialogFooter'
  | 'DialogHeader'
  | 'DialogTitle'
  | 'DialogTrigger'
  | 'Input'
  | 'Label'
  | 'Menubar'
  | 'MenubarMenu'
  | 'MenubarTrigger'
  | 'Pagination'
  | 'PaginationContent'
  | 'PaginationEllipsis'
  | 'PaginationItem'
  | 'PaginationLink'
  | 'PaginationNext'
  | 'PaginationPrevious'
  | 'Progress'
  | 'RadioGroup'
  | 'RadioGroupItem'
  | 'Separator'
  | 'Skeleton'
  | 'Slider'
  | 'Switch'
  | 'Tabs'
  | 'TabsContent'
  | 'TabsList'
  | 'TabsTrigger'
  | 'Textarea'
  | 'Toggle'
  | 'ToggleGroup'
  | 'ToggleGroupItem'
  | 'Tooltip'
  | 'TooltipContent'
  | 'TooltipTrigger'
  | 'Video'
  | 'VideoControls'

export const ComponentPropertiesSchemas: Record<ComponentSchemaName, PropertySchema> = /* @__PURE__ */ (() => ({
  Accordion: AccordionPropertiesSchema,
  AccordionContent: AccordionContentPropertiesSchema,
  AccordionItem: AccordionItemPropertiesSchema,
  AccordionTrigger: AccordionTriggerPropertiesSchema,
  AccordionTriggerIcon: AccordionTriggerIconPropertiesSchema,
  Alert: AlertPropertiesSchema,
  AlertDescription: AlertDescriptionPropertiesSchema,
  AlertIcon: AlertIconPropertiesSchema,
  AlertTitle: AlertTitlePropertiesSchema,
  AlertDialog: AlertDialogPropertiesSchema,
  AlertDialogAction: AlertDialogActionPropertiesSchema,
  AlertDialogCancel: AlertDialogCancelPropertiesSchema,
  AlertDialogContent: AlertDialogContentPropertiesSchema,
  AlertDialogDescription: AlertDialogDescriptionPropertiesSchema,
  AlertDialogFooter: AlertDialogFooterPropertiesSchema,
  AlertDialogHeader: AlertDialogHeaderPropertiesSchema,
  AlertDialogTitle: AlertDialogTitlePropertiesSchema,
  AlertDialogTrigger: AlertDialogTriggerPropertiesSchema,
  Avatar: AvatarPropertiesSchema,
  Badge: BadgePropertiesSchema,
  Button: ButtonPropertiesSchema,
  Card: CardPropertiesSchema,
  CardContent: CardContentPropertiesSchema,
  CardDescription: CardDescriptionPropertiesSchema,
  CardFooter: CardFooterPropertiesSchema,
  CardHeader: CardHeaderPropertiesSchema,
  CardTitle: CardTitlePropertiesSchema,
  Checkbox: CheckboxPropertiesSchema,
  Dialog: DialogPropertiesSchema,
  DialogContent: DialogContentPropertiesSchema,
  DialogDescription: DialogDescriptionPropertiesSchema,
  DialogFooter: DialogFooterPropertiesSchema,
  DialogHeader: DialogHeaderPropertiesSchema,
  DialogTitle: DialogTitlePropertiesSchema,
  DialogTrigger: DialogTriggerPropertiesSchema,
  Input: DefaultInputPropertiesSchema,
  Label: LabelPropertiesSchema,
  Menubar: MenubarPropertiesSchema,
  MenubarMenu: MenubarMenuPropertiesSchema,
  MenubarTrigger: MenubarTriggerPropertiesSchema,
  Pagination: PaginationPropertiesSchema,
  PaginationContent: PaginationContentPropertiesSchema,
  PaginationEllipsis: PaginationEllipsisPropertiesSchema,
  PaginationItem: PaginationItemPropertiesSchema,
  PaginationLink: PaginationLinkPropertiesSchema,
  PaginationNext: PaginationNextPropertiesSchema,
  PaginationPrevious: PaginationPreviousPropertiesSchema,
  Progress: ProgressPropertiesSchema,
  RadioGroup: RadioGroupPropertiesSchema,
  RadioGroupItem: RadioGroupItemPropertiesSchema,
  Separator: SeparatorPropertiesSchema,
  Skeleton: SkeletonPropertiesSchema,
  Slider: SliderPropertiesSchema,
  Switch: SwitchPropertiesSchema,
  Tabs: TabsPropertiesSchema,
  TabsContent: TabsContentPropertiesSchema,
  TabsList: TabsListPropertiesSchema,
  TabsTrigger: TabsTriggerPropertiesSchema,
  Textarea: DefaultTextareaPropertiesSchema,
  Toggle: TogglePropertiesSchema,
  ToggleGroup: ToggleGroupPropertiesSchema,
  ToggleGroupItem: ToggleGroupItemPropertiesSchema,
  Tooltip: TooltipPropertiesSchema,
  TooltipContent: TooltipContentPropertiesSchema,
  TooltipTrigger: TooltipTriggerPropertiesSchema,
  Video: DefaultVideoPropertiesSchema,
  VideoControls: VideoControlsPropertiesSchema,
}))()

export const componentSchemas = ComponentPropertiesSchemas
