import Yoga from 'yoga-layout'

export const PointScaleFactor = 100

export const defaultYogaConfig = Yoga.Config.create()
defaultYogaConfig.setUseWebDefaults(true)
defaultYogaConfig.setPointScaleFactor(PointScaleFactor)
