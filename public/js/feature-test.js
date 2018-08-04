var test;
var ATBrowsers;

var dom_at = document.querySelector('#at');
var dom_browser = document.querySelector('#browser');
var dom_at_version = document.querySelector('#at_version');
var dom_browser_version = document.querySelector('#browser_version');
var dom_os_version = document.querySelector('#os_version');
var addOutputButton = document.querySelector('#add-output');

function initTestingPrefForm()
{
	var form = document.querySelector('form.testing-pref');
	form.addEventListener('submit', function(e) {
		e.preventDefault();
		e.stopPropagation();

		var select = form.querySelector('select');
		var choice = select.value;
		choice = choice.split('/');

		sessionStorage.setItem('at', choice[0]);
		sessionStorage.setItem('browser', choice[1]);
		sessionStorage.removeItem('at_version');
		sessionStorage.removeItem('browser_version');

		displayTestingPrefs(true);
	});
}

function displayTestingPrefs(focusResults)
{
	var at_value = sessionStorage.getItem('at');
	var browser_value = sessionStorage.getItem('browser');

	// Always remove command output that is already in place.
	removeAllCommandOutputRows();

	if (!at_value || !browser_value) {
		// Settings haven't been saved yet. But we still need a placeholder for output.
		createCommandOutputRow(null, false);
		return;
	}

	var resultsContainer = document.querySelector('#testing-pref-results');

	var dl = document.createElement('dl');
	var dt = document.createElement('dt');
	dt.innerText = 'Selected combination';
	var dd = document.createElement('dd');
	dd.innerText = ATBrowsers.at[at_value].short_title  + ' / ' + ATBrowsers.browsers[browser_value].title;
	dl.appendChild(dt);
	dl.appendChild(dd);

	var supportPoint = test.at[at_value].browsers[browser_value];

	var dt = document.createElement('dt');
	dt.innerText = 'Current support';
	var dd = document.createElement('dd');
	dd.innerText = supportPoint.support;
	dl.appendChild(dt);
	dl.appendChild(dd);

	var dt = document.createElement('dt');
	dt.innerText = 'Helpful Links';
	var dd = document.createElement('dd');
	var ul = document.createElement('ul');

	var support_point_url = '/tests/'+test.id+'/'+at_value+'/'+browser_value;
	if (ATBrowsers.at[at_value].support != 'u') {
		var a = document.createElement('a');
		a.setAttribute('href', support_point_url);
		a.innerText = 'View details about the current support point (including versions used)';
		var li = document.createElement('li');
		li.appendChild(a);
		ul.appendChild(li);
	}

	var reviewDetails = document.querySelector('#review-details');
	if (reviewDetails) {
		if (supportPoint.notes || supportPoint.output) {
			var a = document.createElement('a');
			a.href = support_point_url;
			a.innerText = reviewDetails.innerText;
			reviewDetails.innerHTML = '';
			reviewDetails.appendChild(a);

			var span = document.createElement('span');
			span.innerText = ' There are notes that might describe commands that were used.';
			reviewDetails.parentElement.appendChild(span);
			reviewDetails.parentElement.hidden = false;
		} else {
			// There is nothing available to help understand
			reviewDetails.parentElement.hidden = true;
		}
	}

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

	// Pre-fill output rows
	if (supportPoint.output && supportPoint.output.length > 0) {
		for (var i=0; i<supportPoint.output.length; i++) {
			createCommandOutputRow(supportPoint.output[i], false);
		}
	} else {
		// Still require at least one row
		createCommandOutputRow(null, false);
	}

	if (focusResults) {
		heading.focus();
	}

	// Now set form inputs
	var atOption = document.querySelector('#at option[value="'+at_value+'"]');
	atOption.setAttribute('selected', '');
	var browserOption = document.querySelector('#browser option[value="'+browser_value+'"]');
	browserOption.setAttribute('selected', '');
	dom_at_version.value = sessionStorage.getItem('at_version');
	dom_browser_version.value = sessionStorage.getItem('browser_version');
	dom_os_version.value = sessionStorage.getItem('os_version');
}

var removeAllCommandOutputRows = function() {
	var currentRows = addOutputButton.parentElement.querySelectorAll('fieldset');
	for (var i=0; i < currentRows.length; i++) {
		currentRows[i].remove();
	}
};

var createCommandOutputRow = function(outputObject, focus) {
	var currentRows = addOutputButton.parentElement.querySelectorAll('fieldset');
	var key = currentRows.length+1;
	var fieldset = document.createElement('fieldset');
	var legend = document.createElement('legend');
	legend.innerText = 'Output row ' + key;
	fieldset.appendChild(legend);

	// command used
	var div = document.createElement('div');
	div.classList.add('control');
	var label = document.createElement('label');
	label.innerText = 'The command used (required)';
	var span = document.createElement('span');
	var id = 'output_'+key+'_command';
	label.setAttribute('for', id);
	span.innerText = '(list the keystrokes, or describe the gesture or voice command)';
	span.id = id + '_description';
	label.setAttribute('aria-describedby', span.id);
	var commandInput = document.createElement('input');
	commandInput.setAttribute('type', 'text');
	commandInput.setAttribute('id', id);
	commandInput.setAttribute('name', id);
	div.appendChild(label);
	div.insertBefore(span, label.nextSibling);
	div.appendChild(commandInput);
	fieldset.appendChild(div);

	if (outputObject) {
		commandInput.value = outputObject.command;
	}

	// command name used
	var div = document.createElement('div');
	div.classList.add('control');
	var label = document.createElement('label');
	label.innerText = 'The command name (required)';
	var span = document.createElement('span');
	var id = 'output_'+key+'_command_name';
	label.setAttribute('for', id);
	var input = document.createElement('input');
	input.setAttribute('type', 'text');
	input.setAttribute('id', id);
	input.setAttribute('name', id);
	div.appendChild(label);
	div.appendChild(input);
	fieldset.appendChild(div);

	if (outputObject) {
		input.value = outputObject.command_name;
	}

	// output from AT
	var div = document.createElement('div');
	div.classList.add('control');
	var label = document.createElement('label');
	label.innerText = 'Output from AT (required)';
	var id = 'output_'+key+'_output';
	label.setAttribute('for', id);
	var input = document.createElement('input');
	input.setAttribute('type', 'text');
	input.setAttribute('id', id);
	input.setAttribute('name', id);
	div.appendChild(label);
	div.appendChild(input);
	fieldset.appendChild(div);

	if (outputObject) {
		input.value = outputObject.output;
	}

	// Result
	var div = document.createElement('div');
	div.classList.add('control');
	var label = document.createElement('label');
	label.innerText = 'result (required)';
	var id = 'output_'+key+'_result';
	label.setAttribute('for', id);
	var select = document.createElement('select');
	select.setAttribute('id', id);
	select.setAttribute('name', id);
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

	if (outputObject) {
		select.value = outputObject.result;
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
		commandInput.focus();
	}
};


function initFeatureTest() {
	var form = document.querySelector('form.submit-test-result');
	if (!form) {
		return;
	}

	initTestingPrefForm();

	var button = document.querySelector('.toggle-run-test-container');
	var testContainer = document.querySelector('#run-test-container');

	button.addEventListener('click', function() {
		if (button.getAttribute('aria-expanded') === 'true') {
			// It is open, so close it
			testContainer.classList.remove('open');
			button.setAttribute('aria-expanded', 'false');
		} else {
			// Open it
			testContainer.classList.add('open');
			button.setAttribute('aria-expanded', 'true');
		}
	});

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

		var currentRows = addOutputButton.parentElement.querySelectorAll('fieldset');
		for (var i=0; i<currentRows.length; i++) {
			var idPrefix = '#output_'+(i+1);
			var command = document.querySelector(idPrefix+'_command');
			var command_name = document.querySelector(idPrefix+'_command_name');
			var output = document.querySelector(idPrefix+'_command');
			var result = document.querySelector(idPrefix+'_result');

			if (!command.value) {
				errors.push(generateErrorLink(idPrefix+'_command', "Output row " + (i+1) + " command is required"));
				command.setAttribute('aria-invalid', 'true');
			}
			if (!command_name.value) {
				errors.push(generateErrorLink(idPrefix+'_command_name', "Output row " + (i+1) + " command name is required"));
				command_name.setAttribute('aria-invalid', 'true');
			}
			if (!output.value) {
				errors.push(generateErrorLink(idPrefix+'_command', "Output row " + (i+1) + " output is required"));
				output.setAttribute('aria-invalid', 'true');
			}
			if (!result.value) {
				errors.push(generateErrorLink(idPrefix+'_result', "Output row " + (i+1) + " result is required"));
				result.setAttribute('aria-invalid', 'true');
			}

		}

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

		sessionStorage.setItem('at', data.get('at'));
		sessionStorage.setItem('browser', data.get('browser'));
		sessionStorage.setItem('browser_version', data.get('browser_version'));
		sessionStorage.setItem('at_version', data.get('at_version'));
		sessionStorage.setItem('os_version', data.get('os_version'));

		var url = 'https://github.com/accessibilitysupported/accessibilitysupported/issues/new?title=';
		var title = data.get('title') + ' ' + data.get('at') + '/' + data.get('browser');
		url += encodeURIComponent(title);

		var body = '| property | value |\n';
		body += '| --- | --- |\n';

		for (var element of data) {
			if (element[0] === 'notes') {
				continue;
			}
			body += '| '+element[0]+' | ' + element[1] + ' |\n';
		}

		var notes = data.get('notes');
		if (notes) {
			body += '\n\n'+notes+'\n';
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

	var initOutputDetails = function() {
		addOutputButton.addEventListener('click', function(e) {
			e.preventDefault();
			e.stopPropagation();
			createCommandOutputRow(null, true);
		});

		// Always create the first row so that some input/output is required
		createCommandOutputRow(null, false);
	};

	initOutputDetails();
}

// Fetch all of the required data
getJson(window.location.pathname+'.json', function(data) {
	test = data;
	getJson('/ATBrowsers.json', function(data) {
		ATBrowsers = data;

		// Now that we have the data, init search
		initFeatureTest();
		displayTestingPrefs();
	});
});

