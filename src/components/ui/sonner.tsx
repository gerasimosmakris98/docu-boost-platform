
import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-slate-800/90 group-[.toaster]:text-white group-[.toaster]:border-slate-700 group-[.toaster]:shadow-2xl group-[.toaster]:backdrop-blur-sm",
          description: "group-[.toast]:text-slate-300",
          actionButton:
            "group-[.toast]:bg-cyan-600 group-[.toast]:text-white group-[.toast]:hover:bg-cyan-700",
          cancelButton:
            "group-[.toast]:bg-slate-700 group-[.toast]:text-slate-300 group-[.toast]:hover:bg-slate-600",
          success: "group-[.toast]:bg-emerald-800/90 group-[.toast]:border-emerald-700",
          error: "group-[.toast]:bg-red-800/90 group-[.toast]:border-red-700",
          warning: "group-[.toast]:bg-yellow-800/90 group-[.toast]:border-yellow-700",
          info: "group-[.toast]:bg-blue-800/90 group-[.toast]:border-blue-700",
        },
      }}
      position="top-right"
      {...props}
    />
  )
}

export { Toaster, toast }
