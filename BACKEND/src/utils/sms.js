// SMS utility is now handled via Firebase Client-side SDK.
// This mock utility is kept for logging purposes if needed.

export const sendSMS = async (phone, message) => {
    console.log(`[FIREBASE SMS FLOW] Verification initiated for ${phone}`);
    return { success: true };
};
