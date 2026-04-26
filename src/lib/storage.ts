import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage, auth } from './firebase'

export async function uploadDesignImage(file: File): Promise<string> {
  const user = auth.currentUser
  if (!user) throw new Error('Not authenticated')

  const ext = file.name.split('.').pop() ?? 'png'
  const path = `designs/${user.uid}/${Date.now()}.${ext}`
  const storageRef = ref(storage, path)

  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}
