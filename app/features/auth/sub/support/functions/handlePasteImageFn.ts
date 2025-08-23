import { compressImageFn } from "./compressImageFn"

export function handlePasteImageFn(e: React.ClipboardEvent<HTMLTextAreaElement>, setImage: (file: File) => void) {
  const items = e.clipboardData?.items
  if (!items) return

  for (let i = 0; i < items.length; i++) {
    const item = items[i]

    if (item.type.startsWith("image/")) {
      e.preventDefault() // prevert pasting path text (paste image only)

      const originalFile = item.getAsFile()
      if (!originalFile) return

      compressImageFn(originalFile, 2, 0.8)
        .then(compressedFile => {
          const ext = compressedFile.type.split("/")[1] // png, jpeg, webp, etc.
          const renamedFile = new File([compressedFile], `pasted-image.${ext}`, {
            type: compressedFile.type,
            lastModified: Date.now(),
          })

          const reader = new FileReader()
          reader.onloadend = () => setImage(renamedFile)
          reader.readAsDataURL(renamedFile)
        })
        .catch(error => console.error("Image compression failed:", error))
    }
  }
}
