const { formatDate } = require('./timeframe-helper');
function detectFilingConflicts(timeframe, startDate, endDate, allFilings) {
    if (timeframe === 'monthly') {
        return allFilings.find(f =>
            f.timeframe === 'quarterly' &&
            formatDate(f.filing_start_date) <= startDate &&
            formatDate(f.filing_end_date) >= endDate
        );
    }

    if (timeframe === 'quarterly') {
        return allFilings.find(f =>
            f.timeframe === 'monthly' &&
            formatDate(f.filing_start_date) >= startDate &&
            formatDate(f.filing_start_date) <= endDate
        );
    }

    return null;
}

module.exports = { detectFilingConflicts };