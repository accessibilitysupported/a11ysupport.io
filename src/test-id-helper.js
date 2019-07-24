let testHelper = {};

testHelper.makeSafe = function(string) {
    return string.replace(/\//g, '__');
};
testHelper.undoMakeSafe = function(string) {
    return string.replace(/__/g, '/');
};
testHelper.trimTechFromAssertion = function(string) {
    string = string.replace('The assistive technology ', '');
    string = string.replace('The screen reader', '');
    return string;
};

module.exports = testHelper;
