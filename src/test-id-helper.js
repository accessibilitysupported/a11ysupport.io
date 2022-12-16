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

testHelper.generateTestTitle = function(command, at, test) {
    let getHumanLocation = function(location) {
        return location.replace(/(target)/g, "the $1");
    }

    if (command.title && command.steps) {
        return command.title+' using '+at.commands[command.command].name+' ('+at.commands[command.command].command+')';
    }

    if (command.title) {
        return command.title;
    }

    let title = 'Use ' + at.commands[command.command].command + ' ('+at.commands[command.command].name+')';

    if (at.type === 'vc') {
        return title;
    }

    if (command.procedure_key) {
        let procedure = testHelper.getProcedure(test, command.procedure_key);
        return procedure.title;
    }

    if (command.before.virtual_location === 'na') {
        // This is a command where the location of focus/cursor does not matter (like opening a list of elements)
        return title;
    }

    if (command.before.virtual_location === 'target'
        && command.before.focus_location === 'target'
        && command.after === 'target') {
        return title + ' on the target of `'+command.css_target+'`';
    }

    if (command.before.virtual_location === 'start of target'
        && command.before.focus_location === 'start of target'
        && command.after === 'start of target') {
        return title + ' while at the start of `'+command.css_target+'`';
    }

    if (command.before.virtual_location === 'end of target'
        && command.before.focus_location === 'end of target'
        && command.after === 'end of target') {
        return title + ' while at the end of `'+command.css_target+'`';
    }

    if (command.before.virtual_location === 'within target'
        && command.before.focus_location === 'within target'
        && command.after === 'within target') {
        return title + ' while within `'+command.css_target+'`';
    }

    if (command.before.virtual_location === 'before target'
        && command.after === 'target') {
        let suffix = '';
        if (command.before.virtual_location !== command.before.focus_location) {
            suffix = ' (leave keyboard focus '+getHumanLocation(command.before.focus_location)+')'
        }
        return title + ' to navigate forward to `'+command.css_target+'`' + suffix;
    }

    if (command.before.virtual_location === 'before target'
        && command.after === 'within target') {
        let suffix = '';
        if (command.before.virtual_location !== command.before.focus_location) {
            suffix = ' (leave keyboard focus '+getHumanLocation(command.before.focus_location)+')'
        }
        return title + ' to navigate forward into `'+command.css_target+'`'+suffix;
    }

    if (command.before.virtual_location === 'before target'
        && command.after === 'start of target') {
        let suffix = '';
        if (command.before.virtual_location !== command.before.focus_location) {
            suffix = ' (leave keyboard focus '+getHumanLocation(command.before.focus_location)+')'
        }
        return title + ' to navigate forward to the start of `'+command.css_target+'`'+suffix;
    }

    if (command.before.virtual_location === 'after target'
        && command.after === 'target') {
        let suffix = '';
        if (command.before.virtual_location !== command.before.focus_location) {
            suffix = ' (leave keyboard focus '+getHumanLocation(command.before.focus_location)+')'
        }
        return title + ' to navigate backwards to `'+command.css_target+'`'+suffix;
    }

    if (command.before.virtual_location === 'after target'
        && command.after === 'within target') {
        let suffix = '';
        if (command.before.virtual_location !== command.before.focus_location) {
            suffix = ' (leave keyboard focus '+getHumanLocation(command.before.focus_location)+')'
        }
        return title + ' to navigate backwards into `'+command.css_target+'`'+suffix;
    }

    if (command.before.virtual_location === 'after target'
        && command.after === 'end of target') {
        let suffix = '';
        if (command.before.virtual_location !== command.before.focus_location) {
            suffix = ' (leave keyboard focus '+getHumanLocation(command.before.focus_location)+')'
        }
        return title + ' to navigate backwards to the end of `'+command.css_target+'`'+suffix;
    }

    if (command.before.virtual_location === 'within target'
        && command.after === 'end of target') {
        let suffix = '';
        if (command.before.virtual_location !== command.before.focus_location) {
            suffix = ' (leave keyboard focus '+getHumanLocation(command.before.focus_location)+')'
        }
        return title + ' to navigate forwards to the end of `'+command.css_target+'`'+suffix;
    }

    if (command.before.virtual_location === 'within target'
        && command.after === 'after target') {
        let suffix = '';
        if (command.before.virtual_location !== command.before.focus_location) {
            suffix = ' (leave keyboard focus '+getHumanLocation(command.before.focus_location)+')'
        }
        return title + ' to navigate forwards out of `'+command.css_target+'`'+suffix;
    }

    if (command.before.virtual_location === 'within target'
        && command.after === 'start of target') {
        let suffix = '';
        if (command.before.virtual_location !== command.before.focus_location) {
            suffix = ' (leave keyboard focus '+getHumanLocation(command.before.focus_location)+')'
        }
        return title + ' to navigate backwards to the start of `'+command.css_target+'`'+suffix;
    }

    if (command.before.virtual_location === 'within target'
        && command.after === 'before target') {
        let suffix = '';
        if (command.before.virtual_location !== command.before.focus_location) {
            suffix = ' (leave keyboard focus '+getHumanLocation(command.before.focus_location)+')'
        }
        return title + ' to navigate backwards out of `'+command.css_target+'`'+suffix;
    }

    if (command.before.virtual_location === 'within target'
        && command.after === 'within target') {
        let suffix = '';
        if (command.before.virtual_location !== command.before.focus_location) {
            suffix = ' (leave keyboard focus '+getHumanLocation(command.before.focus_location)+')'
        }
        return title + ' to navigate within `'+command.css_target+'`'+suffix;
    }

    return 'unknown'
}

testHelper.getProcedure = function(test, key) {
    return test.procedures.find(obj => {
            return obj.key === key
        }
    );
}

testHelper.getAssertionKey = function(test, feature_id, feature_assertion_id, applied_to, references) {
    if (!references) {
        references = [];
    }
    if (!applied_to) {
        applied_to = null;
    }
    return test.assertions.findIndex(obj => {
            return obj.feature_id === feature_id
                && obj.feature_assertion_id === feature_assertion_id
                && obj.applied_to === applied_to
                && obj.references.join('-') === references.join('-')
        }
    );
}

module.exports = testHelper;
