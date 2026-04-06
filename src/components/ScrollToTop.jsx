import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export default function ScrollToTop() {
    const { pathname } = useLocation();
    const navType = useNavigationType();

    useEffect(() => {
        if (navType === 'PUSH' || navType === 'REPLACE') {
            window.scrollTo(0, 0);
        }
    }, [pathname, navType]);

    return null;
}
