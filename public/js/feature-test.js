var test;
var ATBrowsers;

var dom_at = document.querySelector('#at');
var dom_browser = document.querySelector('#browser');
var dom_at_version = document.querySelector('#at_version');
var dom_browser_version = document.querySelector('#browser_version');
var dom_os_version = document.querySelector('#os_version');
var assertions_container = document.querySelector('#assertions');
var addOutputButton = document.querySelector('#add-output');
var testingPrefForm = document.querySelector('form.testing-pref');
var ATBrowserSelect = testingPrefForm.querySelector('select');
var testUrl = window.location.pathname.replace(/\/run/, '');
var testJsonURL = testUrl.replace(/__/g, '/');

function initTestingPrefForm()
{

	testingPrefForm.addEventListener('submit', function(e) {
		e.preventDefault();
		e.stopPropagation();

		var choice = ATBrowserSelect.value;
		choice = choice.split('/');

		sessionStorage.setItem('at', choice[0]);
		sessionStorage.setItem('browser', choice[1]);

		displayTestingPrefs(true);
	});
}

function displayTestingPrefs(focusResults)
{
	var at_value = sessionStorage.getItem('at');
	var browser_value = sessionStorage.getItem('browser');

	// Always remove command output that is already in place.
	// TODO
	//removeAllCommandOutputRows();

	if (!at_value || !browser_value) {
		// Settings haven't been saved yet. But we still need a placeholder for output.
		createCommandOutputRow(null, false);
		return;
	}

	// Set the ATBrowser selector to the currently selected value
	ATBrowserSelect.value = at_value+'/'+browser_value;

	var resultsContainer = document.querySelector('#testing-pref-results');

	var dl = document.createElement('dl');
	var dt = document.createElement('dt');
	dt.innerText = 'Selected combination';
	var dd = document.createElement('dd');
	dd.innerText = ATBrowsers.at[at_value].short_title  + ' / ' + ATBrowsers.browsers[browser_value].title;
	dl.appendChild(dt);
	dl.appendChild(dd);

	var dt = document.createElement('dt');
	dt.innerText = 'Helpful Links';
	var dd = document.createElement('dd');
	var ul = document.createElement('ul');
	var a = document.createElement('a');
	a.setAttribute('href', '/learn/at/'+at_value);
	a.innerText = 'Learn how to use ' + ATBrowsers.at[at_value].short_title;
	var li = document.createElement('li');
	li.appendChild(a);
	ul.appendChild(li);

	dd.appendChild(ul);
	dl.appendChild(dt);
	dl.appendChild(dd);


	var heading = document.createElement('h4');
	heading.innerText = 'Some helpful information based on your selection';
	heading.setAttribute('tabindex', '-1');

	resultsContainer.innerHTML = '';
	resultsContainer.appendChild(heading);
	resultsContainer.appendChild(dl);
	resultsContainer.classList.add('call-out');

	console.log('create form here', at_value, browser_value);

	// Remove all existing assertion fieldsets
	removeAllAssertionFieldsets();

	// Build new assertion fieldsets
	buildAssertionFieldsets(at_value, browser_value);

	if (focusResults) {
		heading.focus();
	}

	// Now set form inputs
	var atOption = document.querySelector('input[name="at"');
	atOption.value = at_value;
	var browserOption = document.querySelector('input[name="browser"');
	browserOption.value = browser_value;
	dom_at_version.value = sessionStorage.getItem('at_version_'+at_value);
	dom_browser_version.value = sessionStorage.getItem('browser_version_'+browser_value);
	dom_os_version.value = sessionStorage.getItem('os_version_'+at_value);
	var span = document.querySelector('.selected-at-browser-combo');
	span.innerText = ATBrowsers.at[at_value].title + ' and ' + ATBrowsers.browsers[browser_value].title;
}

var removeAllAssertionFieldsets = function() {
	var assertions = document.querySelectorAll('fieldset.assertion');
	for (var i=0; i < assertions.length; i++) {
		assertions[i].remove();
	}
};

var buildAssertionFieldsets = function(at_value, browser_value) {
	test.assertions.forEach(function(assertion, assertion_key) {
		var fieldset = document.createElement('fieldset');
		fieldset.classList.add('assertion');
		var name = assertion.feature_id+'.'+assertion.feature_assertion_id;
		// The feature ID might contain a /, which isn't a valid HTML id. Convert it to a dash.
		fieldset.setAttribute('id', name.replace('/', '-').replace('.', '--'));
		fieldset.setAttribute('data-name', name);
		var legend = document.createElement('legend');
		legend.innerText = assertion.feature_title + ' / ' + assertion.assertion_title;
		fieldset.append(legend);
		var addOutputButton = document.createElement('button');
		addOutputButton.classList.add('add-output-row');
		addOutputButton.innerText = 'add an output row';
		fieldset.append(addOutputButton);

		addOutputButton.addEventListener('click', function(e) {
			e.preventDefault();
			e.stopPropagation();
			createCommandOutputRow(e.target.parentNode, null, true);
		});

		// TODO: add details (such as selector)

		// TODO: Add output rows

		var supportPoint = assertion.results[at_value].browsers[browser_value];
		if (supportPoint.output) {
			supportPoint.output.forEach(function(row, row_key) {
				createCommandOutputRow(fieldset, row, false);
			});
		} else {
			createCommandOutputRow(fieldset, null, false);
		}

		assertions_container.append(fieldset);
	});
};

var removeAllCommandOutputRows = function(assertion_fieldset) {
	var currentRows = assertion_fieldset.querySelectorAll('fieldset.output-row');
	for (var i=0; i < currentRows.length; i++) {
		currentRows[i].remove();
	}
};

var createCommandOutputRow = function(assertion_fieldset, output_row, focus) {
	var addOutputButton = assertion_fieldset.querySelector('button.add-output-row');
	var currentRows = assertion_fieldset.querySelectorAll('fieldset.output-row');
	var key = currentRows.length+1;
	var fieldset = document.createElement('fieldset');
	fieldset.classList.add('output-row');
	var legend = document.createElement('legend');
	legend.innerText = 'Output row ' + key;
	fieldset.appendChild(legend);


    var div = document.createElement('div');
    div.classList.add('control');
    var id = assertion_fieldset.getAttribute('id')+'--output_'+key+'_command';
    var command_select = document.createElement('select');
    command_select.setAttribute('id', id);
    command_select.setAttribute('name', assertion_fieldset.getAttribute('data-name')+'.output_'+key+'_command');
    var label = document.createElement('label');
    label.innerText = 'The command used (required)';
    label.setAttribute('for', id);
    div.appendChild(label);

    // Default null state
	var option = document.createElement('option');
	option.innerText = '-- select an option --';
	option.setAttribute('value', '');
	command_select.appendChild(option);

    var at_value = sessionStorage.getItem('at');
	var keys = Object.getOwnPropertyNames(ATBrowsers.at[at_value].commands);
    for (var i=0; i<ATBrowsers.command_tags.length; i++) {
    	var tag = ATBrowsers.command_tags[i];
    	var optgroup = null;
        for (var ii=0; ii<keys.length; ii++) {
        	var command = ATBrowsers.at[at_value].commands[keys[ii]];
        	if (!command.tags.includes(tag.id)) {
        		continue;
			}
			if (!optgroup) {
				// Create the optgroup
				optgroup = document.createElement('optgroup');
				optgroup.setAttribute('label', tag.name);
				command_select.appendChild(optgroup);
			}
			// Create the option
            var option = document.createElement('option');
            option.innerText = command.name;
            option.innerText += ' ('+command.command+')';
            option.setAttribute('value', keys[ii]);

            if (output_row && output_row.command === keys[ii]) {
            	option.setAttribute('selected', 'selected');
            }

            optgroup.appendChild(option);
        }
    }

    div.appendChild(command_select);
    fieldset.appendChild(div);

	// output from AT
	var div = document.createElement('div');
	div.classList.add('control');
	var label = document.createElement('label');
	label.innerText = 'Output from AT (required)';
	var id = assertion_fieldset.getAttribute('id')+'--output_'+key+'_output'; //TODO add the assertion_id
	label.setAttribute('for', id);
	var input = document.createElement('input');
	input.setAttribute('type', 'text');
	input.setAttribute('id', id);
	input.setAttribute('name', assertion_fieldset.getAttribute('data-name')+'.output_'+key+'_output');
	div.appendChild(label);
	div.appendChild(input);
	fieldset.appendChild(div);

	if (output_row) {
		input.value = output_row.output;
	}

	// Result
	var div = document.createElement('div');
	div.classList.add('control');
	var label = document.createElement('label');
	label.innerText = 'result (required)';
	var id = assertion_fieldset.getAttribute('id')+'--output_'+key+'_result';
	label.setAttribute('for', id);
	var select = document.createElement('select');
	select.setAttribute('id', id);
	select.setAttribute('name', assertion_fieldset.getAttribute('data-name')+'.output_'+key+'_result');
	var option = document.createElement('option');
	option.innerText = 'pass';
	option.value = 'pass';
	select.appendChild(option);
	var option = document.createElement('option');
	option.innerText = 'fail';
	option.value = 'fail';
	select.appendChild(option);
	var option = document.createElement('option');
	option.innerText = 'partial';
	option.value = 'partial';
	select.appendChild(option);
	div.appendChild(label);
	div.appendChild(select);
	fieldset.appendChild(div);

	if (output_row) {
		select.value = output_row.result;
	}

	if (currentRows.length > 0) {
		// Don't allow removing the first row
		var removeButton = document.createElement('button');
		removeButton.innerText = 'Remove this row';
		removeButton.addEventListener('click', function(e) {
			e.preventDefault();
			fieldset.remove();
			addOutputButton.focus();
		});
		fieldset.appendChild(removeButton);
	}

	addOutputButton.parentElement.insertBefore(fieldset, addOutputButton);

	if (focus) {
        command_select.focus();
	}
};


function initFeatureTest() {
	var form = document.querySelector('form.submit-test-result');
	if (!form) {
		return;
	}

	initTestingPrefForm();

	var validate = function(data) {
		var errors = [];

		function generateErrorLink(url, text) {
			let link = document.createElement('a');
			link.setAttribute('href', url);
			link.innerText = text;
			return link;
		}

		if (!dom_at.value) {
			errors.push(generateErrorLink("#at", "'AT used' is required"));
			dom_at.setAttribute('aria-invalid', 'true');
		}
		if (!dom_browser.value) {
			errors.push(generateErrorLink("#browser", "'Browser used' is required"));
			dom_browser.setAttribute('aria-invalid', 'true');
		}
		if (!dom_at_version.value) {
			errors.push(generateErrorLink("#at_version", "'AT version' is required"));
			dom_at_version.setAttribute('aria-invalid', 'true');
		}
		if (!dom_browser_version.value) {
			errors.push(generateErrorLink("#browser_version", "'Browser version' is required"));
			dom_browser_version.setAttribute('aria-invalid', 'true');
		}
		if (!dom_os_version.value) {
			errors.push(generateErrorLink("#os_version", "'OS version' is required"));
			dom_os_version.setAttribute('aria-invalid', 'true');
		}

		var assertion_fieldsets = document.querySelectorAll('fieldset.assertion');
		assertion_fieldsets.forEach(function(assertion_fieldset) {
			var currentRows = assertion_fieldset.querySelectorAll('fieldset.output-row');
			for (var i=0; i<currentRows.length; i++) {
				var assertion_fieldset = currentRows[i].closest('fieldset.assertion');
				var id = assertion_fieldset.getAttribute('id');
				var idPrefix = '#'+id+'--'+'output_'+(i+1);
				var command = document.querySelector(idPrefix+'_command');
				var output = document.querySelector(idPrefix+'_command');
				var result = document.querySelector(idPrefix+'_result');

				if (!command.value) {
					errors.push(generateErrorLink(idPrefix+'_command', "Output row " + (i+1) + " command is required"));
					command.setAttribute('aria-invalid', 'true');
				}
				if (!output.value) {
					errors.push(generateErrorLink(idPrefix+'_output', "Output row " + (i+1) + " output is required"));
					output.setAttribute('aria-invalid', 'true');
				}
				if (!result.value) {
					errors.push(generateErrorLink(idPrefix+'_result', "Output row " + (i+1) + " result is required"));
					result.setAttribute('aria-invalid', 'true');
				}
			}
		});


		if (errors.length) {
			var ul = document.createElement('ul');
			for (var i=0; i<errors.length; i++) {
				var li = document.createElement('li');
				li.appendChild(errors[i]);
				ul.appendChild(li);
			}

			var error_container = document.querySelector('#error_container');
			var headding = document.createElement('h2');
			headding.innerText = 'Error';

			error_container.innerHTML = '';
			error_container.appendChild(headding);
			error_container.appendChild(ul);
			error_container.setAttribute('tabindex', '-1');
			error_container.focus();

			return false;
		}

		return true;
	};


	form.addEventListener('submit', function(e) {
		e.preventDefault();
		e.stopPropagation();

		var data = new FormData(e.target);

		if (!validate(data)) {
			return;
		}

		var at_value = data.get('at').toString();
		var browser_value = data.get('browser').toString();
		sessionStorage.setItem('at', data.get('at'));
		sessionStorage.setItem('browser', data.get('browser'));
		sessionStorage.setItem('browser_version_'+browser_value, data.get('browser_version'));
		sessionStorage.setItem('at_version_'+at_value, data.get('at_version'));
		sessionStorage.setItem('os_version_'+at_value, data.get('os_version'));

		var url = 'https://github.com/accessibilitysupported/accessibilitysupported/issues/new?title=';
		var title = data.get('title') + ' ' + data.get('at') + '/' + data.get('browser');
		url += encodeURIComponent(title);

		var body = 'This Support Point submission is for the test ['+test.title+']('+testUrl+')\n\n';

		body += '| property | value |\n';
		body += '| --- | --- |\n';

		var entries = Array.from(data.entries());
        for (var i=0; i<entries.length; i++) {
            if (entries[i][0] === 'notes') {
                continue;
            }
            body += '| '+entries[i][0]+' | ' + entries[i][1] + ' |\n';
        }

		var notes = data.get('notes');
		if (notes) {
			body += '\n== begin notes ==\n';
			body +=  notes;
			body += '\n== end notes ==\n';
		}

		var isCore = false;
		if (ATBrowsers.core_at.includes(data.get('at')) && ATBrowsers.at[data.get('at')].core_browsers.includes(data.get('browser'))) {
			isCore = true;
		}

		url += '&body='+encodeURIComponent(body);

		let labels = [encodeURIComponent('needs verification'), encodeURIComponent('support point')];

		if (isCore) {
			labels.push(encodeURIComponent('core support'));
		} else {
			labels.push(encodeURIComponent('extended support'));
		}

		url += '&labels='+labels.join(',');

		window.location = url;
	});

	// TODO: fix output rows
	// initOutputDetails();
}

// Fetch all of the required data
var test_id =
getJson(testJsonURL +'.json', function(data) {
	test = data;
	getJson('/ATBrowsers.json', function(data) {
		ATBrowsers = data;

        var at_value = sessionStorage.getItem('at');
        var browser_value = sessionStorage.getItem('browser');

        // IF at_value isn't set, set it to the first option.
        if (!at_value) {
            at_value = 'dragon_win';
            sessionStorage.setItem('at', at_value);
        }

        // If browser_value isn't set, set it to the first core browser for the current AT
        if (!browser_value) {
            browser_value = ATBrowsers.at[at_value].core_browsers[0];
            sessionStorage.setItem('browser', browser_value);
        }

		// Now that we have the data, init search
		initFeatureTest();
		displayTestingPrefs();
	});
});

