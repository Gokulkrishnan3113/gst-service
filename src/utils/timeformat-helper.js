const { formatDate } = require('./timeframe-helper');
function formatFilingDates(filing) {
    return {
        ...filing,
        filing_start_date: formatDate(filing.filing_start_date),
        filing_end_date: formatDate(filing.filing_end_date),
        due_date: formatDate(filing.due_date),
    };
}

function formatMultipleFilingDates(filings) {
    return filings.map(filing => formatFilingDates(filing));
}

module.exports = { formatFilingDates, formatMultipleFilingDates };