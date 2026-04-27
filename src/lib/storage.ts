// Cloudinary Storage Adapter - Free image storage
// 25GB free - No credit card needed

const CLOUDINARY_CLOUD_NAME = 'djznmf2fp'
const CLOUDINARY_UPLOAD_PRESET = 'JM-ESTILO'

interface CloudinaryUploadResponse {
  public_id: string
  secure_url: string
  format: string
  width: number
  height: number
}

/**
 * Upload image to Cloudinary
 * Free tier: 25GB storage, 25GB bandwidth
 */
export async function uploadImage(
  file: File | Blob | string
): Promise<CloudinaryUploadResponse> {
  let dataUrl: string
  
  // Convert file to data URL if needed
  if (typeof file !== 'string') {
    dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  } else {
    dataUrl = file
  }
  
  // Remove prefix from base64
  const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '')
  
  // Upload to Cloudinary
  const formData = new FormData()
  formData.append('file', base64Data)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )
  
  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`)
  }
  
  return response.json()
}

/**
 * Upload base64 image directly
 */
export async function uploadBase64(base64: string): Promise<CloudinaryUploadResponse> {
  // Remove prefix from base64
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '')
  
  const formData = new FormData()
  formData.append('file', base64Data)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )
  
  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`)
  }
  
  return response.json()
}

/**
 * Get optimized image URL
 */
export function getImageUrl(publicId: string, options: {
  width?: number
  height?: number
  crop?: 'fit' | 'fill' | 'scale'
  quality?: 'auto' | number
} = {}): string {
  const transforms: string[] = []
  
  if (options.width) transforms.push(`w_${options.width}`)
  if (options.height) transforms.push(`h_${options.height}`)
  if (options.crop) transforms.push(`c_${options.crop}`)
  if (options.quality) transforms.push(`q_${options.quality}`)
  
  const transform = transforms.length > 0 ? `${transforms.join(',')}/` : ''
  
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transform}${publicId}`
}

export default {
  uploadImage,
  uploadBase64,
  getImageUrl
}