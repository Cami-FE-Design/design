import { CheckIcon } from "lucide-react"
import { AuthLayout } from "@/components/blocks/auth-layout"

export default function SetupDonePage() {
  return (
    <AuthLayout splitPane={false}>
      <div className="flex w-full flex-col items-center justify-center gap-6 self-stretch px-6 py-24">
        <div className="flex size-16 items-center justify-center rounded-full bg-cami-violet-3">
          <CheckIcon className="size-8 text-cami-violet-9" strokeWidth={2.5} />
        </div>
        <h1 className="text-center text-5xl leading-[1.05] font-semibold tracking-tight text-foreground lg:text-6xl">
          Your business is set up
        </h1>
      </div>
    </AuthLayout>
  )
}
