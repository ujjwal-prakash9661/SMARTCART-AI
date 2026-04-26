import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// TODO: Download serviceAccountKey.json from Firebase Console -> Project Settings -> Service Accounts
// and place it in BACKEND/src/config/serviceAccountKey.json
import serviceAccount from '../config/serviceAccountKey.json' assert { type: 'json' };

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

export const verifyFirebaseToken = async (idToken) => {
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        return decodedToken;
    } catch (error) {
        console.error("Firebase Token Verification Error:", error.message);
        throw error;
    }
};
