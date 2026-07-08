import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { SignFormFlow } from "@/components/blocks/sign/sign-form-flow"
import { getSignableForm, listSignableFormTokens } from "@/lib/signable-form"

type Params = Promise<{ token: string }>

export function generateStaticParams() {
  return listSignableFormTokens().map((token) => ({ token }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { token } = await params
  const form = getSignableForm(token)
  if (!form) {
    return { title: "Page not found", robots: { index: false, follow: false } }
  }
  return {
    title: `Sign · ${form.formName}`,
    description: `Review and sign the ${form.formName} from ${form.businessName}.`,
    robots: { index: false, follow: false },
  }
}

export default async function SignFormPage({ params }: { params: Params }) {
  const { token } = await params
  const form = getSignableForm(token)

  if (!form) {
    notFound()
  }

  return <SignFormFlow form={form} />
}
