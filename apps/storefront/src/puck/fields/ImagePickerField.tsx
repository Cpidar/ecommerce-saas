// fields/imagePicker.tsx
"use client"

import { useState } from "react"
import Image from "next/image"
import type { StaticImageData } from "next/image"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageIcon, Upload, Link2, Trash2 } from "lucide-react"

export type ImageSource = string | StaticImageData

interface ImagePickerFieldProps {
  label?: string
  value?: ImageSource
  onChange: (value: ImageSource | undefined) => void
  placeholder?: string
  name: string
  field?: { label: string }
}

export const ImagePickerField = ({ 
  label,
  value, 
  onChange, 
  name, 
  field,
  placeholder = "Click to select an image"
}: ImagePickerFieldProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState("")

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    // Simulate upload - replace with your actual upload logic
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      onChange(result)
      setUploading(false)
      setIsDialogOpen(false)
    }
    reader.readAsDataURL(file)
  }

  const handleUrlSubmit = () => {
    if (!urlInput) return
    onChange(urlInput)
    setUrlInput("")
    setIsDialogOpen(false)
  }

  const handleRemove = () => {
    onChange(undefined)
  }

  // Helper to get string src from value
  const getImageSrc = (img: ImageSource): string => {
    if (typeof img === 'string') return img
    return img.src
  }

  return (
    <div className="space-y-4">
      <Label htmlFor={name} className="text-sm font-medium">
        {field?.label || label || name}
      </Label>

      {/* Image Preview */}
      {value ? (
        <div className="relative group">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
            <Image
              src={getImageSrc(value)}
              alt="Selected image"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 300px"
            />
          </div>
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsDialogOpen(true)}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Change
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setIsDialogOpen(true)}
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 p-8 hover:bg-muted/80 transition-colors"
        >
          <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium text-muted-foreground">
            {placeholder}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Supports: JPG, PNG, GIF, SVG, WebP
          </p>
        </div>
      )}

      {/* Image URL Preview */}
      {value && (
        <div className="text-xs text-muted-foreground">
          <p className="truncate">URL: {getImageSrc(value)}</p>
        </div>
      )}

      {/* Image Selection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Select Image</DialogTitle>
            <DialogDescription>
              Choose an image from your media library or upload a new one
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="upload" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="url">URL</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-4">
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop or click to upload
                </p>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="max-w-xs"
                />
                {uploading && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Uploading...
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="url" className="mt-4">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                  />
                  <Button onClick={handleUrlSubmit} disabled={!urlInput}>
                    <Link2 className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter the URL of an image from the web
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ImagePickerField