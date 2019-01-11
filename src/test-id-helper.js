let testIdHelper = {};

testIdHelper.makeSafe = function(string) {
    return string.replace(/\//g, '__');
};
testIdHelper.undoMakeSafe = function(string) {
    return string.replace(/__/g, '/');
};

module.exports = testIdHelper;
