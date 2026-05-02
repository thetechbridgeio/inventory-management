import { Label } from "./label"

export function FormField({
  label,
  icon: Icon,
  helper,
  children,
}: {
  label: string
  icon?: any
  helper?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label>
        {Icon && <Icon className="inline h-4 w-4 mr-2" />}
        {label}
      </Label>
      {children}
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
    </div>
  )
}