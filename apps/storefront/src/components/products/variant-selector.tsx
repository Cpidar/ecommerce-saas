"use client"

// [MY-FORK-PRODUCT] Added useState and useEffect imports for local state management
import { useMemo } from "react"
import type { ProductVariant } from "@/types"
import { cn } from "@/lib/utils/utils"

interface VariantSelectorProps {
  variants: ProductVariant[]
  selectedVariantId: string
  onSelect: (variantId: string) => void
}

export function VariantSelector({
  variants,
  selectedVariantId,
  onSelect,
}: VariantSelectorProps) {
  const selectedVariant = variants.find((v) => v.id === selectedVariantId)

  // [MY-FORK-PRODUCT] Use local state to track selected options instead of relying solely on selectedVariant
  const selectedOptions = useMemo(() => {
    const optionsMap = new Map<string, string>()
    selectedVariant?.options.forEach((opt) => {
      optionsMap.set(opt.name, opt.value)
    })
    return optionsMap
  }, [selectedVariant])

  // Group variants by option name
  const optionGroups = new Map<string, Set<string>>()
  for (const variant of variants) {
    for (const option of variant.options) {
      if (!optionGroups.has(option.name)) {
        optionGroups.set(option.name, new Set())
      }
      optionGroups.get(option.name)!.add(option.value)
    }
  }
  if (optionGroups.size === 0) return null

  // [MY-FORK-PRODUCT] New handler that considers ALL selected options when finding a variant
  // Original code just found the first variant with matching option in that group
  const handleOptionSelect = (optionName: string, value: string) => {
    // Update selected options
    const newSelected = new Map(selectedOptions)
    newSelected.set(optionName, value)

    // [MY-FORK-PRODUCT] Find variant that matches ALL currently selected options
    // This is the core fix - we need complete match, not partial
    const matchingVariant = variants.find(variant =>
      Array.from(newSelected.entries()).every(([name, val]) =>
        variant.options.some(opt => opt.name === name && opt.value === val)
      )
    )

    if (matchingVariant) {
      onSelect(matchingVariant.id)
    }
  }

  // [MY-FORK-PRODUCT] New helper to check if an option is available
  // Given current selections in ALL groups, not just one
  const isOptionAvailable = (optionName: string, value: string) => {
    // Create a test selection with this option
    const testSelected = new Map(selectedOptions)
    testSelected.set(optionName, value)

    // [MY-FORK-PRODUCT] Check if there's a variant matching all selected options
    const matchingVariant = variants.find(variant =>
      Array.from(testSelected.entries()).every(([name, val]) =>
        variant.options.some(opt => opt.name === name && opt.value === val)
      )
    )

    if (!matchingVariant) return false
    return matchingVariant.inventory.quantity > 0 || matchingVariant.inventory.allowBackorder
  }

  return (
    <div className="space-y-4">
      {Array.from(optionGroups.entries()).map(([optionName, values]) => (
        <div key={optionName}>
          <label className="text-sm font-medium">
            {optionName}
            {selectedVariant && (
              <span className="ml-2 font-normal text-muted-foreground">
                {/* [MY-FORK-PRODUCT] Display selected value from local state instead of variant */}
                {selectedOptions.get(optionName) ?? ""}
              </span>
            )}
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {Array.from(values).map((value) => {
              // [MY-FORK-PRODUCT] Check selection from local state, not variant object
              const isSelected = selectedOptions.get(optionName) === value
              
              // [MY-FORK-PRODUCT] Check availability considering all selections
              const isAvailable = isOptionAvailable(optionName, value)

              return (
                <button
                  key={value}
                  // [MY-FORK-PRODUCT] Use new handler that considers all options
                  onClick={() => handleOptionSelect(optionName, value)}
                  disabled={!isAvailable}
                  className={cn(
                    "border px-3 py-1.5 text-sm transition-colors",
                    isSelected
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground",
                    // [MY-FORK-PRODUCT] Uncommented disabled styles for unavailable options
                    !isAvailable && "cursor-not-allowed opacity-40"
                  )}
                  aria-label={`${optionName}: ${value}`}
                  aria-pressed={isSelected}
                >
                  {value}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}