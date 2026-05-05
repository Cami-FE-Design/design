import { redirect } from "next/navigation"

export default function NewBusinessRedirect() {
  redirect("/admin/businesses")
}
