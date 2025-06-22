const southAndWestStates = [
    'chhattisgarh', 'madhyapradesh', 'gujarat', 'damananddiu', 'dadranagarhaveli',
    'maharashtra', 'karnataka', 'goa', 'lakshadweep', 'kerala', 'tamilnadu',
    'puducherry', 'andamanandnicobarislands', 'telangana', 'andhrapradesh'
];


function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function getTimeframeRange(timeframe, state) {
    const today = new Date();
    // const today = new Date('2025-02-22');

    const filingDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const year = filingDate.getFullYear();
    const month = filingDate.getMonth();

    let startDate, endDate, dueDate;

    switch (timeframe) {
        case 'monthly': {
            const prevMonthDate = new Date(year, month - 1, 1);
            const prevMonthYear = prevMonthDate.getFullYear();
            const prevMonth = prevMonthDate.getMonth();

            startDate = new Date(prevMonthYear, prevMonth, 1);
            endDate = new Date(prevMonthYear, prevMonth + 1, 0);
            dueDate = new Date(year, month, 20);
            break;
        }

        case 'quarterly': {
            const normalizedState = state.toLowerCase().replace(/\s+/g, '');
            const currentQuarter = Math.floor(month / 3);
            const prevQuarter = currentQuarter === 0 ? 3 : currentQuarter - 1;
            const qYear = currentQuarter === 0 ? year - 1 : year;
            const quarterStartMonth = prevQuarter * 3;

            startDate = new Date(qYear, quarterStartMonth, 1);
            endDate = new Date(qYear, quarterStartMonth + 3, 0);

            const dueDateDay = southAndWestStates.includes(normalizedState) ? 22 : 24;
            dueDate = new Date(year, quarterStartMonth + 3, dueDateDay);
            break;
        }

        case 'annual': {
            const fyStartYear = month < 3 ? year - 2 : year - 1;

            startDate = new Date(fyStartYear, 3, 1);
            endDate = new Date(fyStartYear + 1, 3, 0);
            dueDate = new Date(fyStartYear + 1, 11, 31);
            break;
        }

        default:
            throw new Error('Invalid timeframe');
    }

    return {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dueDate: formatDate(dueDate),
        isLate: filingDate > dueDate
    };
}

module.exports = { getTimeframeRange, formatDate };
