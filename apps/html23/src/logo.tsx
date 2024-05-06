import { cn } from './lib/utils.js'

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-row gap-3 flex-shrink-0 items-center', className)}>
      <img className="w-6 h-6" src="./icon.svg" />
      <h1 className="font-bold">HTML23</h1>
    </div>
  )
}
