import { format, set, setDay } from 'date-fns';

export function formatDate(dateString) {
    const date = new Date(dateString);
    const currentYear = new Date().getFullYear();
    if (date.getFullYear() === currentYear) {
        return format(date, 'MMMM d');
    }
    return format(date, 'MMMM d, yyyy');
}
