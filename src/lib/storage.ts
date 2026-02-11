/**
 * Safe wrapper for localStorage.setItem to handle QuotaExceededError
 */
export const safeLocalStorageSet = (key: string, value: any) => {
    try {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        localStorage.setItem(key, stringValue);
        return true;
    } catch (e) {
        if (e instanceof DOMException && (
            e.code === 22 ||
            e.code === 1014 ||
            e.name === 'QuotaExceededError' ||
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED')
        ) {
            console.error('LocalStorage quota exceeded!', e);

            // Strategic cleanup: Remove large items or clear everything non-essential
            // For MentorDesk, we might want to clear cached user data but keep the token
            const token = localStorage.getItem('token');
            localStorage.clear();
            if (token) localStorage.setItem('token', token);

            // Try setting it again if it's essential
            try {
                const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
                localStorage.setItem(key, stringValue);
                return true;
            } catch (retryError) {
                console.error('Retry failed after clearing:', retryError);
                return false;
            }
        }
        return false;
    }
};

export const safeLocalStorageGet = (key: string) => {
    try {
        const item = localStorage.getItem(key);
        if (!item) return null;
        try {
            return JSON.parse(item);
        } catch {
            return item;
        }
    } catch (e) {
        console.error('Error reading from localStorage:', e);
        return null;
    }
};
