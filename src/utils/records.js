// src/utils/records.js
import { getDatabase, ref, get, update, set } from "firebase/database"

export async function saveRecord(game, newValue, difficulty = null, preferHigher = true) {
    const { getAuth } = await import("firebase/auth")
    const auth = getAuth()
    const user = auth.currentUser
    if (!user) return

    const db = getDatabase()

    const recordPath = difficulty
        ? `records/${user.uid}/${game}/${difficulty}`
        : `records/${user.uid}/${game}`

    const recordRef = ref(db, recordPath)
    const snapshot = await get(recordRef)

    const current = snapshot.val()
    const shouldUpdate = !current || (preferHigher ? newValue > current : newValue < current)

    if (shouldUpdate) {
        await set(recordRef, newValue)
    }
}
