"use client"

import { ChevronDownIcon } from "lucide-react"
import { Accordion as AccordionPrimitive } from "radix-ui"
import type * as React from "react"
import { cn } from "@/lib/utils"

function Accordion({ ...props }: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        "overflow-hidden rounded-2xl border border-border/60 bg-background transition-colors data-open:bg-muted/20",
        className,
      )}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger flex flex-1 items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/20 [&[data-state=open]_>_svg.accordion-chevron]:rotate-180",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon className="accordion-chevron size-5 shrink-0 text-muted-foreground transition-transform duration-200 ease-out lg:self-center" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="grid grid-rows-[0fr] overflow-hidden transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] data-open:grid-rows-[1fr]"
      {...props}
    >
      <div className={cn("min-h-0 px-5 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger }
