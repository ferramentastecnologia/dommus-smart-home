
import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { X } from "lucide-react"
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TagInputProps {
  placeholder?: string
  tags: { id: string; name: string; color: string }[]
  selectedTags: string[]
  onTagSelect: (tagId: string) => void
  onTagRemove: (tagId: string) => void
  onCreateTag?: (name: string) => void
  className?: string
}

export function TagInput({
  placeholder = "Add tag...",
  tags,
  selectedTags,
  onTagSelect,
  onTagRemove,
  onCreateTag,
  className,
}: TagInputProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const selectedTagObjects = tags.filter((tag) => selectedTags.includes(tag.id))
  const filteredTags = tags.filter((tag) => 
    !selectedTags.includes(tag.id) &&
    tag.name.toLowerCase().includes(inputValue.toLowerCase())
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && inputValue && onCreateTag) {
      e.preventDefault()
      onCreateTag(inputValue)
      setInputValue("")
    }
  }

  return (
    <div className={cn("relative", className)}>
      <div className="flex flex-wrap gap-2 p-1 border rounded-md bg-background">
        {selectedTagObjects.map((tag) => (
          <Badge
            key={tag.id}
            style={{ backgroundColor: tag.color + "20", color: tag.color, borderColor: tag.color }}
            className="flex items-center gap-1 px-3 py-1 border"
          >
            {tag.name}
            <X
              size={14}
              className="cursor-pointer opacity-70 hover:opacity-100"
              onClick={() => onTagRemove(tag.id)}
            />
          </Badge>
        ))}
        <Command className="overflow-hidden w-full min-w-[180px] border-0 p-0">
          <CommandInput
            value={inputValue}
            onValueChange={setInputValue}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="border-0 focus:ring-0 px-1 h-8"
            onFocus={() => setOpen(true)}
          />
          {open && (inputValue || filteredTags.length > 0) && (
            <CommandList className="absolute z-10 w-full mt-1 rounded-md border bg-popover shadow-md">
              <CommandGroup>
                {filteredTags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={tag.id}
                    onSelect={() => {
                      onTagSelect(tag.id)
                      setInputValue("")
                      setOpen(false)
                    }}
                  >
                    <Badge
                      style={{ backgroundColor: tag.color + "20", color: tag.color, borderColor: tag.color }}
                      className="border"
                    >
                      {tag.name}
                    </Badge>
                  </CommandItem>
                ))}
                {inputValue && onCreateTag && (
                  <CommandItem
                    onSelect={() => {
                      onCreateTag(inputValue)
                      setInputValue("")
                      setOpen(false)
                    }}
                  >
                    <span className="text-muted-foreground">
                      Create tag "{inputValue}"
                    </span>
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          )}
        </Command>
      </div>
    </div>
  )
}
