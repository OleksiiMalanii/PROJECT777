import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '/src/firebase';

/**
 * Awards a badge to a user if they don't already have it.
 * @param {string} uid - Firebase Auth user ID
 * @param {string} gameId - Game ID (e.g., 'minesweeper')
 * @param {string} badgeId - Badge document ID (e.g., 'Speedy Medium Solver')
 */
export async function giveBadge(uid, gameId, badgeId) {
    if (!uid || !gameId || !badgeId) return;

    const userBadgeRef = doc(db, 'users', uid, 'badges', gameId);
    const userBadgeSnap = await getDoc(userBadgeRef);

    let badgeIds = [];

    if (userBadgeSnap.exists()) {
        badgeIds = userBadgeSnap.data().badgeIds || [];
        if (badgeIds.includes(badgeId)) {
            return; // Already has the badge
        }
    }

    badgeIds.push(badgeId);
    await setDoc(userBadgeRef, { badgeIds }, { merge: true });
    console.log(`Badge '${badgeId}' awarded to user ${uid}`);
}
