"use client"

import { Button } from "@/components/ui/button"
import { Glow } from "@/components/ui/glow"
import { cn } from "@/lib/utils"

interface CTAProps {
  title: string
  actions: {
    primary: {
      text: string
      href: string
      variant?: "default" | "glow"
    }
    secondary: {
      text: string
      href: string
      variant?: "default" | "glow"
    }
  }
  className?: string
}

export function CTASection({ title, actions, className }: CTAProps) {
  return (
    <section className={cn("group relative overflow-hidden py-24 sm:py-32", className)}>
      <div className="relative z-10 mx-auto flex max-w-container flex-col items-center gap-6 text-center sm:gap-8">
        <h2 className="text-3xl font-semibold sm:text-5xl animate-appear">
          {title}
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 animate-appear delay-100">
          <Button 
            variant={actions.primary.variant || "glow"} 
            size="lg" 
            className="min-w-[200px]"
            asChild
          >
            <a href={actions.primary.href}>{actions.primary.text}</a>
          </Button>
          <Button 
            variant={actions.secondary.variant || "outline"} 
            size="lg" 
            className="min-w-[200px] border-blue-200 text-blue-100 hover:bg-blue-100 hover:text-slate-900"
            asChild
          >
            <a href={actions.secondary.href}>{actions.secondary.text}</a>
          </Button>
        </div>
      </div>
      <div className="absolute left-0 top-0 h-full w-full translate-y-[1rem] opacity-80 transition-all duration-500 ease-in-out group-hover:translate-y-[-2rem] group-hover:opacity-100">
        <Glow variant="bottom" className="animate-appear-zoom delay-300" />
      </div>
    </section>
  )
}