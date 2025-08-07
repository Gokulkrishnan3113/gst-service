const MAC_REGEX = /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/i;

function normalizeMacInput(mac) {
    if (typeof mac === 'string') return [mac];
    if (Array.isArray(mac)) return mac;
    return [];
}

function isValidMacArray(macArray) {
    return Array.isArray(macArray) &&
        macArray.length > 0 &&
        macArray.every(mac => typeof mac === 'string' && MAC_REGEX.test(mac));
}

module.exports = {
    normalizeMacInput,
    isValidMacArray
};
