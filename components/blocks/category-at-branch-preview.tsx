"use client"

/**
 * A category a branch has emptied, drawn both ways (GNK §4).
 *
 * Their document asks the question and does not answer it: the business has a
 * Spa category with three services, this branch has no spa room and has turned
 * all three off. Does the branch see no Spa category at all, or the heading
 * with nothing under it?
 *
 * Both are defensible, so both are here rather than one being chosen in a
 * comment. The same call was made for the nine-branch layouts (D5): draw the
 * two, look at them, decide — a question in a document gets an opinion back,
 * two screens get a decision.
 */

import { BuildingIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"

export type PreviewCategory = {
  id: string
  name: string
  /** Services the business has in it. */
  services: string[]
  /** Which of those this branch offers. */
  offered: string[]
}

export function CategoryAtBranchPreview({
  categories,
  branchName,
  mode,
}: {
  categories: PreviewCategory[]
  branchName: string
  /** `hidden` drops an emptied category; `empty` keeps its heading. */
  mode: "hidden" | "empty"
}) {
  const visible = mode === "hidden" ? categories.filter((c) => c.offered.length > 0) : categories

  return (
    <div className="flex w-full flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4">
      <div className="flex items-center gap-2">
        <BuildingIcon className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">{branchName}</span>
        <Badge variant="muted" size="sm">
          {mode === "hidden" ? "Emptied categories hidden" : "Emptied categories shown"}
        </Badge>
      </div>

      <ul className="flex flex-col gap-3">
        {visible.map((category) => (
          <li key={category.id} className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-foreground">{category.name}</span>
            {category.offered.length > 0 ? (
              <ul className="flex flex-col gap-1">
                {category.offered.map((svc) => (
                  <li key={svc} className="text-sm leading-5 text-muted-foreground">
                    {svc}
                  </li>
                ))}
              </ul>
            ) : (
              /* Said in terms of this branch, not of the category. "No services"
                 reads as a catalog nobody filled in; "not offered here" is the
                 fact, and it is the branch's own decision. */
              <p className="rounded-xl bg-muted/50 p-2.5 text-sm leading-5 text-muted-foreground">
                Not offered at {branchName}. The business has {category.services.length}, all turned
                off here.
              </p>
            )}
          </li>
        ))}
      </ul>

      {mode === "hidden" && categories.some((c) => c.offered.length === 0) ? (
        <p className="text-xs leading-4 text-muted-foreground">
          {categories.filter((c) => c.offered.length === 0).length} category not shown.
        </p>
      ) : null}
    </div>
  )
}
