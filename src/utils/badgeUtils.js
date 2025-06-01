import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '/src/firebase';

/**
 * Awards a badge to a user if they don't already have it.
 * @param {string} uid - Firebase Auth user ID
 * @param {string} gameId - Game ID (e.g., 'minesweeper')
 * @param {string} badgeId - Badge document ID (e.g., 'first_blood')
 */
export async function giveBadge(uid, gameId, badgeId) {
    try {
        if (!uid || !gameId || !badgeId) {
            console.warn('Missing required parameters for giveBadge:', { uid, gameId, badgeId });
            return false;
        }

        console.log(`Attempting to give badge: ${badgeId} to user: ${uid} for game: ${gameId}`);

        // Перевіряємо чи існує бейдж у системі
        const badgeRef = doc(db, 'badges', gameId, 'badgeList', badgeId);
        const badgeSnap = await getDoc(badgeRef);

        if (!badgeSnap.exists()) {
            console.warn(`Badge ${badgeId} does not exist in game ${gameId}. Creating badge definition...`);

            // Створюємо базове визначення бейджа якщо його немає
            const badgeDefinitions = {
                // minesweeper
                'first_blood': {
                    name: 'First Blood',
                    description: 'Complete your first game',
                    iconUrl: '/src/assets/Games/Badge.png'
                },
                'speedrunner_easy': {
                    name: 'Speed Demon',
                    description: 'Complete Easy in under 30 seconds',
                    iconUrl: '/src/assets/Games/Badge.png'
                },
                'fasthead': {
                    name: 'Fast Head',
                    description: 'Complete Medium in under 60 seconds',
                    iconUrl: '/src/assets/Games/Badge.png'
                },
                'speedrunner_hard': {
                    name: 'Lightning Fast',
                    description: 'Complete Hard in under 120 seconds',
                    iconUrl: '/src/assets/Games/Badge.png'
                },
                'survivor': {
                    name: 'Survivor',
                    description: 'Complete Hard difficulty',
                    iconUrl: '/src/assets/Games/Badge.png'
                },
                'flawless_victory': {
                    name: 'Flawless Victory',
                    description: 'Win without using flags',
                    iconUrl: '/src/assets/Games/Badge.png'
                },
                'perfectionist': {
                    name: 'Perfectionist',
                    description: 'Win 5 games without using flags',
                    iconUrl: '/src/assets/Games/Badge.png'
                },
                'veteran_player': {
                    name: 'Veteran Player',
                    description: 'Win 10 games',
                    iconUrl: '/src/assets/Games/Badge.png'
                },

                // spaceshooter
                'space_first_blood': {
                    name: 'Space Pilot',
                    description: 'Complete your first space mission',
                    iconUrl: '/src/assets/Games/Badge.png'
                },
                'space_score_1000_easy': {
                    name: 'Rookie Scorer',
                    description: 'Score 1000 points on Easy difficulty',
                    iconUrl: '/src/assets/Games/Badge.png'
                },
                'space_score_1000_medium': {
                    name: 'Cadet Scorer',
                    description: 'Score 1000 points on Medium difficulty',
                    iconUrl: '/src/assets/Games/Badge.png'
                },
                'space_score_1000_hard': {
                    name: 'Veteran Scorer',
                    description: 'Score 1000 points on Hard difficulty',
                    iconUrl: '/src/assets/Games/Badge.png'
                },
                'space_score_3000_easy': {
                    name: 'Elite Pilot',
                    description: 'Score 3000 points on Easy difficulty',
                    iconUrl: '/src/assets/Games/Badge.png'
                },
                'space_score_3000_medium': {
                    name: 'Ace Pilot',
                    description: 'Score 3000 points on Medium difficulty',
                    iconUrl: '/src/assets/Games/Badge.png'
                },
                'space_score_3000_hard': {
                    name: 'Commander',
                    description: 'Score 3000 points on Hard difficulty',
                    iconUrl: '/src/assets/Games/Badge.png'
                },
                'space_score_5000_easy': {
                    name: 'Space Legend',
                    description: 'Score 5000 points on Easy difficulty',
                    iconUrl: '/src/assets/Games/Badge.png'
                },
                'space_score_5000_medium': {
                    name: 'Galaxy Hero',
                    description: 'Score 5000 points on Medium difficulty',
                    iconUrl: '/src/assets/Games/Badge.png'
                },
                'space_score_5000_hard': {
                    name: 'Universe Master',
                    description: 'Score 5000 points on Hard difficulty',
                    iconUrl: '/src/assets/Games/Badge.png'
                },
                'space_enemies_100': {
                    name: 'Squadron Destroyer',
                    description: 'Destroy 100 enemies in a single game',
                    iconUrl: '/src/assets/Games/Badge.png'
                },
                'space_enemies_300': {
                    name: 'Fleet Annihilator',
                    description: 'Destroy 300 enemies in a single game',
                    iconUrl: '/src/assets/Games/Badge.png'
                }
            };


            if (badgeDefinitions[badgeId]) {
                await setDoc(badgeRef, badgeDefinitions[badgeId]);
                console.log(`Created badge definition for: ${badgeId}`);
            } else {
                console.error(`No definition found for badge: ${badgeId}`);
                return false;
            }
        }

        // Отримуємо або створюємо документ користувача
        const userBadgeRef = doc(db, 'users', uid, 'badges', gameId);
        const userBadgeSnap = await getDoc(userBadgeRef);

        let badgeIds = [];
        if (userBadgeSnap.exists()) {
            badgeIds = userBadgeSnap.data().badgeIds || [];
            if (badgeIds.includes(badgeId)) {
                console.log(`User ${uid} already has badge ${badgeId}`);
                return false; // Already has the badge
            }
        } else {
            console.log(`Creating new badge document for user ${uid} and game ${gameId}`);
        }

        badgeIds.push(badgeId);
        await setDoc(userBadgeRef, {
            badgeIds,
            lastUpdated: new Date().toISOString()
        }, { merge: true });

        console.log(`Badge '${badgeId}' successfully awarded to user ${uid}`);
        return true;
    } catch (error) {
        console.error('Error awarding badge:', error);
        return false;
    }
}

/**
 * Перевіряє чи має користувач певний бейдж
 * @param {string} uid - Firebase Auth user ID
 * @param {string} gameId - Game ID
 * @param {string} badgeId - Badge ID
 */
export async function hasBadge(uid, gameId, badgeId) {
    try {
        const userBadgeRef = doc(db, 'users', uid, 'badges', gameId);
        const userBadgeSnap = await getDoc(userBadgeRef);

        if (userBadgeSnap.exists()) {
            const badgeIds = userBadgeSnap.data().badgeIds || [];
            return badgeIds.includes(badgeId);
        }

        return false;
    } catch (error) {
        console.error('Error checking badge:', error);
        return false;
    }
}