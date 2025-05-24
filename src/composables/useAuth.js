import { ref } from 'vue';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
} from 'firebase/auth';
import { auth } from '/src/firebase';

const user = ref(null);

auth.onAuthStateChanged((u) => {
    user.value = u;
});

const register = async (email, password, username = '') => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (cred && cred.user && username.trim()) {
        await updateProfile(cred.user, {
            displayName: username.trim(),
        });
        user.value = cred.user;
    }
};

const login = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
};

const logout = async () => {
    await signOut(auth);
};

export function useAuth() {
    return {
        user,
        register,
        login,
        logout,
    };
}
