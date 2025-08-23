const compressAndResizeImage = async (file: File, quality: number, maxWidth: number, maxHeight: number): Promise<File> => {
  const image = await createImageBitmap(file)
  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d")

  canvas.width = Math.min(image.width, maxWidth)
  canvas.height = (canvas.width / image.width) * image.height

  context?.drawImage(image, 0, 0, canvas.width, canvas.height)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (blob) {
          resolve(new File([blob], file.name, { type: file.type }))
        } else {
          reject(new Error("Image compression failed"))
        }
      },
      file.type,
      quality,
    )
  })
}

export async function compressImageFn(file: File, maxSizeMB: number, initialQuality: number): Promise<File> {
  let compressedFile = await compressAndResizeImage(file, initialQuality, 1920, 1080)

  while (compressedFile.size > maxSizeMB * 1024 * 1024 && initialQuality > 0.1) {
    initialQuality -= 0.2 // Reduce quality by 0.2
    compressedFile = await compressAndResizeImage(compressedFile, initialQuality, 1920, 1080)
  }

  while (compressedFile.size > maxSizeMB * 1024 * 1024) {
    const image = await createImageBitmap(compressedFile)
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")

    canvas.width = image.width * 0.8
    canvas.height = image.height * 0.8
    context?.drawImage(image, 0, 0, canvas.width, canvas.height)

    compressedFile = await new Promise((resolve, reject) => {
      canvas.toBlob(
        blob => {
          if (blob) {
            resolve(new File([blob], file.name, { type: file.type }))
          } else {
            reject(new Error("Image compression failed"))
          }
        },
        file.type,
        initialQuality,
      )
    })
    console.log(`Resized image: ${compressedFile.size / 1024} KB`)
  }

  if (compressedFile.size > maxSizeMB * 1024 * 1024) {
    throw new Error("Compressed image still exceeds size limit.")
  }

  return compressedFile
}
