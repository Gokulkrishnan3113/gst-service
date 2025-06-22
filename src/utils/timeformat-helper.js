const { formatDate } = require('./timeframe-helper');
function formatFilingDates(filings) {
    return filings.map(filing => ({
        ...filing,
        filing_start_date: formatDate(filing.filing_start_date),
        filing_end_date: formatDate(filing.filing_end_date),
        due_date: formatDate(filing.due_date),
    }));
}
module.exports = {
    formatFilingDates
};