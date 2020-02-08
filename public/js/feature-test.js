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
var versions = {};

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

	if (!at_value || !browser_value) {
		// Settings haven't been saved yet. fail early.
		return;
	}

	var step_2 = document.querySelector('#step2');
	step_2.removeAttribute('hidden');

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

	// Remove all existing assertion fieldsets
	removeAllAssertionFieldsets();

	// Build new assertion fieldsets
	buildAssertionFieldsets(at_value, browser_value);

	if (focusResults) {
		heading.focus();
	}

	// Now set form inputs
	var atOption = document.querySelector('input[name="at"]');
	atOption.value = at_value;
	var browserOption = document.querySelector('input[name="browser"]');
	browserOption.value = browser_value;
	if (sessionStorage.getItem('at_version_'+at_value)) {
		dom_at_version.value = sessionStorage.getItem('at_version_'+at_value);
	} else if (versions.at[at_value] && versions.browsers[browser_value]) {
		dom_at_version.value = versions.at[at_value].at_version;
	}

	if (sessionStorage.getItem('browser_version_'+browser_value)) {
		dom_browser_version.value = sessionStorage.getItem('browser_version_'+browser_value);
	} else if (versions.at[at_value] && versions.browsers[browser_value]) {
		dom_browser_version.value = versions.browsers[browser_value].version;
	}

	if (sessionStorage.getItem('os_version_'+at_value)) {
		dom_os_version.value = sessionStorage.getItem('os_version_'+at_value);
	} else if (versions.at[at_value] && versions.browsers[browser_value]) {
		dom_os_version.value = versions.at[at_value].os_version;
	}

	var span = document.querySelector('.selected-at-browser-combo');
	span.innerText = ATBrowsers.at[at_value].title + ' and ' + ATBrowsers.browsers[browser_value].title;
}

var removeAllAssertionFieldsets = function() {
	var assertions = document.querySelectorAll('fieldset.assertion');
	for (var i=0; i < assertions.length; i++) {
		assertions[i].parentNode.remove();
	}
};

var buildAssertionFieldsets = function(at_value, browser_value) {

	var num_fieldsets = 0;
	test.assertions.forEach(function(assertion, assertion_key) {

		if (-1 === assertion.supports_at.indexOf(ATBrowsers.at[at_value].type)) {
			return;
		}

		var supportPoint = assertion.results[at_value].browsers[browser_value];
		if (supportPoint && supportPoint.support === "na") {
			// don't render assertions that are not applicable
			return;
		}

		num_fieldsets++;

		var fieldset = document.createElement('fieldset');
		fieldset.classList.add('assertion');
		fieldset.setAttribute('data-feature-assertion-id', assertion.feature_assertion_id);
		fieldset.setAttribute('data-feature-id', assertion.feature_id);
		fieldset.setAttribute('data-assertion-key', assertion_key);
		var name = assertion.feature_id+'.'+assertion.feature_assertion_id;
		// The feature ID might contain a /, which isn't a valid HTML id. Convert it to a dash.
		fieldset.setAttribute('id', name
			.replace('/', '-')
			.replace('.', '--')
			.replace('(', '-')
			.replace(')', '-')
		);
		fieldset.setAttribute('data-name', name);
		var legend = document.createElement('legend');
		var short_title = assertion.assertion_title;
		short_title = short_title.replace('The assistive technology ', '');
		short_title = short_title.replace('The screen reader', '');
		legend.innerText = assertion.feature_title + ': ' + short_title;
		fieldset.append(legend);

		var p = document.createElement('p');
		p.innerText = 'The following are instructions for testing this expectation.';

		var instructions_ol = document.createElement('ol');
		var li = document.createElement('li');
		li.innerText = 'Find all elements in the example that match this selector: ';
		var strong = document.createElement('strong');
		strong.innerText = assertion.css_target;
		li.appendChild(strong);
		instructions_ol.appendChild(li);

		var li = document.createElement('li');
		li.innerText = 'Navigate to each matching element and interact with it. Record your findings below for every command that you used.';
		instructions_ol.appendChild(li);

		var li = document.createElement('li');
		li.innerText = 'Does the output meet the expectation? Record your findings below for every command that you used.';
		instructions_ol.appendChild(li);

		if (assertion.expected_value) {
			var li = document.createElement('li');
			li.innerText = 'Expected value: ' + assertion.css_target;
			instructions_ol.appendChild(li);
		}

		fieldset.append(p);
		fieldset.append(instructions_ol);

		// Example output
		if (assertion.assertion_examples && assertion.assertion_examples.length) {
			var p = document.createElement('p');
			p.innerText = 'The following are some examples of how assistive technologies might support this expectation.';
			var examples_ul = document.createElement('ul');

			assertion.assertion_examples.forEach(function(example) {
				var li = document.createElement('li');
				li.innerText = example;
				examples_ul.append(li);
			});

			fieldset.append(p);
			fieldset.append(examples_ul);
		}

		var addOutputButton = document.createElement('button');
		addOutputButton.classList.add('add-output-row');
		addOutputButton.innerText = 'add an output row';
		fieldset.append(addOutputButton);

		addOutputButton.addEventListener('click', function(e) {
			e.preventDefault();
			e.stopPropagation();
			createCommandOutputRow(assertion, e.target.parentNode, null, true);
		});

		var noteLabel = document.createElement('label');
		noteLabel.innerText = 'Notes';
		noteLabel.setAttribute('for', fieldset.getAttribute('id')+'--note');
		var noteTextarea = document.createElement('textarea');
        noteTextarea.setAttribute('id', fieldset.getAttribute('id')+'--note');
        noteTextarea.setAttribute('name', fieldset.getAttribute('data-name')+'.note');

        if (assertion.results[at_value].browsers[browser_value].notes) {
            noteTextarea.innerText = assertion.results[at_value].browsers[browser_value].notes;
        }
        fieldset.append(noteLabel);
        fieldset.append(noteTextarea);

		// TODO: add details (such as selector)

		// TODO: Add output rows

		if (supportPoint.output) {
			supportPoint.output.forEach(function(row, row_key) {
				createCommandOutputRow(assertion, fieldset, row, false);
			});
		} else {
			createCommandOutputRow(assertion, fieldset, null, false);
		}

		var assertion_container = document.createElement('div');
		assertion_container.classList.add('assertion-container');
		assertion_container.append(fieldset);
		assertions_container.append(assertion_container);
	});

	if (num_fieldsets === 0) {
		var message = document.createElement('p');
		message.innerText = "Sorry, no assertions apply to the chosen testing combination.";
		assertions_container.append(message);
	}
};

var removeAllCommandOutputRows = function(assertion_fieldset) {
	var currentRows = assertion_fieldset.querySelectorAll('fieldset.output-row');
	for (var i=0; i < currentRows.length; i++) {
		currentRows[i].remove();
	}
};

var createCommandOutputRow = function(assertion, assertion_fieldset, output_row, focus) {
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
	command_select.setAttribute('data-property', 'command');
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

        	var include = false;
			assertion.operation_modes.forEach(function(tag) {
				if (command.tags.includes(tag)) {
					include = true;
				}
			});

			if (!include) {
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

	// at mode before command is executed
	var div = document.createElement('div');
	div.classList.add('control');
	var label = document.createElement('label');
	label.innerText = 'AT mode before executing the command';
	var id = assertion_fieldset.getAttribute('id')+'--output_'+key+'_before_mode';
	label.setAttribute('for', id);
	var select = document.createElement('select');
	select.setAttribute('id', id);
	select.setAttribute('data-property', 'before');
	select.setAttribute('data-sub-property', 'mode');
	select.setAttribute('name', assertion_fieldset.getAttribute('data-name')+'.output_'+key+'_before_mode');
	var options = [
		{
			label: 'auto (mode not explicitly set; usually browse mode for screen readers)',
			value: 'auto'
		},
		{
			label: 'browse mode (browse, document, or table)',
			value: 'browse'
		},
		{
			label: 'forms mode (form or application mode)',
			value: 'forms'
		},
		{
			label: 'n/a',
			value: 'na'
		}
	];

	options.forEach(function(data) {
		var option = document.createElement('option');
		option.innerText = data.label;
		option.value = data.value;

		if (output_row && output_row.before.mode === data.value) {
			option.setAttribute('selected', 'selected');
		} else if (!output_row && ATBrowsers.at[at_value].type === "vc" && data.value === "na") {
			option.setAttribute('selected', 'selected');
		}

		select.appendChild(option);
	});
	div.appendChild(label);
	div.appendChild(select);
	fieldset.appendChild(div);

    // keyboard focus target before
	var div = document.createElement('div');
	div.classList.add('control');
	var label = document.createElement('label');
	label.innerText = 'Location of keyboard focus before executing the command';
	var id = assertion_fieldset.getAttribute('id')+'--output_'+key+'_before_focus';
	label.setAttribute('for', id);
	var select = document.createElement('select');
	select.setAttribute('id', id);
	select.setAttribute('data-property', 'before');
	select.setAttribute('data-sub-property', 'focus_location');
	select.setAttribute('name', assertion_fieldset.getAttribute('data-name')+'.output_'+key+'_before_focus');
	var options = [
		{
			label: 'unknown',
			value: ''
		},
		{
			label: 'before target',
			value: 'before target'
		},
		{
			label: 'after target',
			value: 'after target'
		},
		{
			label: 'start of target',
			value: 'start of target'
		},
		{
			label: 'target',
			value: 'target'
		},
		{
			label: 'within target',
			value: 'within target'
		},
		{
			label: 'end of target',
			value: 'end of target'
		},
		{
			label: 'n/a',
			value: 'na'
		}
	];

	options.forEach(function(data) {
		var option = document.createElement('option');
		option.innerText = data.label;
		option.value = data.value;

		if (output_row && output_row.before.focus_location === data.value) {
			option.setAttribute('selected', 'selected');
		} else if (!output_row && ATBrowsers.at[at_value].type === "vc" && data.value === "na") {
			option.setAttribute('selected', 'selected');
		}

		select.appendChild(option);
	});
	div.appendChild(label);
	div.appendChild(select);
	fieldset.appendChild(div);

	// virtual cursor target before
	var div = document.createElement('div');
	div.classList.add('control');
	var label = document.createElement('label');
	label.innerText = 'Location of virtual cursor before executing the command';
	var id = assertion_fieldset.getAttribute('id')+'--output_'+key+'_before_virtual';
	label.setAttribute('for', id);
	var select = document.createElement('select');
	select.setAttribute('id', id);
	select.setAttribute('data-property', 'before');
	select.setAttribute('data-sub-property', 'virtual_location');
	select.setAttribute('name', assertion_fieldset.getAttribute('data-name')+'.output_'+key+'_before_virtual');
	var options = [
		{
			label: 'unknown',
			value: ''
		},
		{
			label: 'before target',
			value: 'before target'
		},
		{
			label: 'after target',
			value: 'after target'
		},
		{
			label: 'start of target',
			value: 'start of target'
		},
		{
			label: 'target',
			value: 'target'
		},
		{
			label: 'within target',
			value: 'within target'
		},
		{
			label: 'end of target',
			value: 'end of target'
		},
		{
			label: 'n/a',
			value: 'na'
		}
	];

	options.forEach(function(data) {
		var option = document.createElement('option');
		option.innerText = data.label;
		option.value = data.value;

		if (output_row && output_row.before.virtual_location === data.value) {
			option.setAttribute('selected', 'selected');
		} else if (!output_row && ATBrowsers.at[at_value].type === "vc" && data.value === "na") {
			option.setAttribute('selected', 'selected');
		}

		select.appendChild(option);
	});
	div.appendChild(label);
	div.appendChild(select);
	fieldset.appendChild(div);

	// target after command
	var div = document.createElement('div');
	div.classList.add('control');
	var label = document.createElement('label');
	label.innerText = 'Location of focus or virtual cursor after command';
	var id = assertion_fieldset.getAttribute('id')+'--output_'+key+'_after';
	label.setAttribute('for', id);
	var select = document.createElement('select');
	select.setAttribute('data-property', 'after');
	select.setAttribute('id', id);
	select.setAttribute('name', assertion_fieldset.getAttribute('data-name')+'.output_'+key+'_after');
	var options = [
		{
			label: 'unknown',
			value: ''
		},
		{
			label: 'target',
			value: 'target'
		},
		{
			label: 'start of target',
			value: 'start of target'
		},
		{
			label: 'end of target',
			value: 'end of target'
		},
		{
			label: 'past target',
			value: 'past target'
		},
		{
			label: 'before target',
			value: 'before target'
		},
		{
			label: 'within target',
			value: 'within target'
		},
		{
			label: 'after target',
			value: 'after target'
		},
		{
			label: 'n/a',
			value: 'na'
		}
	];

	options.forEach(function(data) {
		var option = document.createElement('option');
		option.innerText = data.label;
		option.value = data.value;

		if (output_row && output_row.after === data.value) {
			option.setAttribute('selected', 'selected');
		}

		select.appendChild(option);
	});
	div.appendChild(label);
	div.appendChild(select);
	fieldset.appendChild(div);


	// output from AT
	var div = document.createElement('div');
	div.classList.add('control');
	var label = document.createElement('label');
	label.innerText = 'Output from AT (required)';
	var id = assertion_fieldset.getAttribute('id')+'--output_'+key+'_output';
	label.setAttribute('for', id);
	var input = document.createElement('input');
	input.setAttribute('data-property', 'output');
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
	select.setAttribute('data-property', 'result');
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

	// support is locked behind settings
	var div = document.createElement('div');
	div.classList.add('control');
	var label = document.createElement('label');
	label.innerText = 'If support is hidden behind non-default settings, briefly describe that setting';
	var id = assertion_fieldset.getAttribute('id')+'--output_'+key+'_behind_setting';
	label.setAttribute('for', id);
	var input = document.createElement('input');
	input.setAttribute('data-property', 'behind_setting');
	input.setAttribute('type', 'text');
	input.setAttribute('id', id);
	input.setAttribute('name', assertion_fieldset.getAttribute('data-name')+'.output_'+key+'_behind_setting');
	div.appendChild(label);
	div.appendChild(input);
	fieldset.appendChild(div);

	if (output_row && output_row.behind_setting) {
		input.value = output_row.behind_setting;
	}

	// output notes
	var div = document.createElement('div');
	div.classList.add('control');
	var label = document.createElement('label');
	label.innerText = 'Brief notes';
	var id = assertion_fieldset.getAttribute('id')+'--output_'+key+'_notes';
	label.setAttribute('for', id);
	var input = document.createElement('input');
	input.setAttribute('data-property', 'notes');
	input.setAttribute('type', 'text');
	input.setAttribute('id', id);
	input.setAttribute('name', assertion_fieldset.getAttribute('data-name')+'.output_'+key+'_notes');
	div.appendChild(label);
	div.appendChild(input);
	fieldset.appendChild(div);

	if (output_row && output_row.notes) {
		input.value = output_row.notes;
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
				var assertion_legend = assertion_fieldset.querySelector('legend');
				var id = assertion_fieldset.getAttribute('id');
				var idPrefix = '#'+id+'--'+'output_'+(i+1);
				var command = document.querySelector(idPrefix+'_command');
				var output = document.querySelector(idPrefix+'_command');
				var result = document.querySelector(idPrefix+'_result');

				if (!command.value) {
					errors.push(generateErrorLink(idPrefix+'_command', assertion_legend.innerText+ " - Output row " + (i+1) + " command is required"));
					command.setAttribute('aria-invalid', 'true');
				}
				if (!output.value) {
					errors.push(generateErrorLink(idPrefix+'_output', assertion_legend.innerText+ " - Output row " + (i+1) + " output is required"));
					output.setAttribute('aria-invalid', 'true');
				}
				if (!result.value) {
					errors.push(generateErrorLink(idPrefix+'_result', assertion_legend.innerText+ " - Output row " + (i+1) + " result is required"));
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
		var dom_title = document.querySelector('input[name="title"]');

		var body = 'This Support Point submission is for the test ['+test.title+']('+testUrl+')\n\n';

		body += 'meta info\n\n';

		body += '| property | value |\n';
		body += '| --- | --- |\n';
        body += '| title | ' + dom_title.value + ' |\n';
		body += '| at | ' + dom_at.value + ' |\n';
        body += '| at_version | ' + dom_at_version.value + ' |\n';
        body += '| browser | ' + dom_browser.value + ' |\n';
        body += '| browser_version | ' + dom_browser_version.value + ' |\n';
        body += '| os_version | ' + dom_os_version.value + ' |\n';

        var assertion_fieldsets = document.querySelectorAll('fieldset.assertion');

        assertion_fieldsets.forEach(function(fieldset) {
            var legend = fieldset.querySelector('legend');
            var output_rows = fieldset.querySelectorAll('fieldset.output-row');
			var output_body = '';
			var assertion_key = parseInt(fieldset.getAttribute("data-assertion-key"));

			output_rows.forEach(function(output_row, output_row_index) {
				var controls = output_row.querySelectorAll('input, select');
				if (test.assertions[assertion_key].results[at_value].browsers[browser_value].support === "na") {
					// nothing to report here
					return;
				}

				var current = test.assertions[assertion_key].results[at_value].browsers[browser_value].output[output_row_index];


				controls.forEach(function(control) {
					var name = control.getAttribute('name');
					name = name.split('.');
					name = name[name.length -1]; // the name is namespaced, and we already provide that namespace info, so just send the last bit.
					var property = control.getAttribute('data-property');
					var subProperty = control.getAttribute('data-sub-property');

					if (subProperty) {
						// We need to check sub properties a bit differently
						if (current[property][subProperty] === control.value
							|| (current[property][subProperty] === undefined && control.value === '')) {
							// Only send over changes in data.
							return;
						}
					} else {
						// we need to check sub properties a bit differentlyß
						if (current[property] === control.value
							|| (current[property] === undefined && control.value === '')) {
							// Only send over changes in data.
							return;
						}
					}

					var old_value = '';
					if (subProperty && current[property][subProperty]) {
						old_value = current[property][subProperty];
					} else if (current[property]) {
						old_value = current[property];
					}

					output_body += '| ' + name + ' | ' + control.value + ' | ' + old_value + ' |\n';
				});
			});

			var note = fieldset.querySelector('textarea');

			if (note.value && note.value !== test.assertions[assertion_key].results[at_value].browsers[browser_value].notes) {
				output_body += '\n== begin notes ==\n';
				output_body +=  note.value;
				output_body += '\n== end notes ==\n';
			}

			if (output_body) {
				body += '\n\n';
				body += legend.innerText+'\n\n';
				body += '| property | new value | old value |\n';
				body += '| --- | --- | --- |\n';
				body += '| feature_id | ' + fieldset.getAttribute('data-feature-id') + ' | - |\n';
				body += '| feature_assertion_id | ' + fieldset.getAttribute('data-feature-assertion-id') + ' | - |\n';
				body += output_body;
			}
        });

		var isCore = false;
		if (ATBrowsers.core_at.includes(data.get('at')) && ATBrowsers.at[data.get('at')].core_browsers.includes(data.get('browser'))) {
			isCore = true;
		}

		//url += '&body='+encodeURIComponent(body);

		let labels = [encodeURIComponent('needs verification'), encodeURIComponent('support point')];

		if (isCore) {
			labels.push(encodeURIComponent('core support'));
		} else {
			labels.push(encodeURIComponent('extended support'));
		}

		// url += '&labels='+labels.join(',');

		var outputDiv = document.getElementById('output');
		var outputHeading = document.getElementById('output-heading');
		var issueBody = document.getElementById('issue-body');
		var issueLink = document.getElementById('issue-link');

		issueBody.value = body;
		issueLink.setAttribute('href', url);
		outputDiv.removeAttribute('hidden');
		outputHeading.focus();
	});
}

// Fetch all of the required data
getJson(testJsonURL +'.json', function(data) {
	test = data;
	getJson('/ATBrowsers.json', function(data) {
		ATBrowsers = data;
		getJson('/latest_versions.json', function(data) {
			versions = data;

			// Now that we have the data, init search
			initFeatureTest();
			displayTestingPrefs();
		});
	});
});

