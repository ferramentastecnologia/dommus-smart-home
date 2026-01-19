
import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const tagColors = [
  "#8B5CF6", // Purple
  "#D946EF", // Pink
  "#F97316", // Orange
  "#0EA5E9", // Blue
  "#10B981", // Green
  "#EF4444", // Red
  "#6366F1", // Indigo
  "#EC4899", // Rose
  "#F59E0B", // Amber
  "#14B8A6", // Teal
]

interface TagCreatorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateTag: (name: string, color: string) => void
}

export function TagCreatorDialog({ open, onOpenChange, onCreateTag }: TagCreatorDialogProps) {
  const [name, setName] = React.useState("")
  const [selectedColor, setSelectedColor] = React.useState(tagColors[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onCreateTag(name.trim(), selectedColor)
      setName("")
      setSelectedColor(tagColors[0])
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new tag</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tag name"
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {tagColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full cursor-pointer transition-all ${
                      selectedColor === color
                        ? "ring-2 ring-offset-2 ring-green-500"
                        : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!name.trim()}>
              Create Tag
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
