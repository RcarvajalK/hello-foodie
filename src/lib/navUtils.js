const REDIRECT_KEY = 'hf_redirect_url';

export const saveRedirectUrl = (url) => {
    if (!url || url === '/auth' || url === '/onboarding') return;
    sessionStorage.setItem(REDIRECT_KEY, url);
};

export const getAndClearRedirectUrl = () => {
    const url = sessionStorage.getItem(REDIRECT_KEY);
    sessionStorage.removeItem(REDIRECT_KEY);
    return url || '/';
};
