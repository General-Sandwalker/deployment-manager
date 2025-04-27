"use client"

import { ReactNode, createContext, useContext, useState } from "react"

type ToastProps = {
  id: string
  title?: string
  description?: string
  action?: ReactNode
  variant?: "default" | "destructive"
}

type ToastContextType = {
  toasts: ToastProps[]
  toast: (props: Omit<ToastProps, "id">) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = (props: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prevToasts) => [...prevToasts, { id, ...props }])
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      dismiss(id)
    }, 5000)
  }

  const dismiss = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 p-4 space-y-2 md:p-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`w-full max-w-md p-4 rounded-lg border shadow-lg transition-all transform animate-in slide-in-from-right-full ${
              toast.variant === "destructive"
                ? "bg-red-600 border-red-700 text-white"
                : "bg-[var(--cosmic-blue)] border-[var(--cosmic-accent)] text-white"
            }`}
          >
            {toast.title && (
              <h3 className="font-medium">{toast.title}</h3>
            )}
            {toast.description && (
              <p className="text-sm mt-1 opacity-90">{toast.description}</p>
            )}
            {toast.action && (
              <div className="mt-2">{toast.action}</div>
            )}
            <button
              className="absolute top-2 right-2 text-sm opacity-70 hover:opacity-100"
              onClick={() => dismiss(toast.id)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}