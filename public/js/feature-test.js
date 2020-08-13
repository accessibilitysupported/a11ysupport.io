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

	// Remove current combo
	hideAllCombos();

	let section = document.querySelector('#combo-'+at_value+'-'+browser_value);
	console.log(section);
	section.removeAttribute('hidden');

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

var hideAllCombos = function() {
	var combos = document.querySelectorAll('.combo');
	for (var i=0; i < assertions.length; i++) {
		combos[i].setAttribute('hidden', true);
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

		var commands = document.querySelectorAll('#combo-'+at_value+'-'+browser_value+' fieldset.command');
		console.log(commands);

		var diff = '';

		let getDiff = function(title, before, after) {
			var diff = '';
			if (before === after) {
				return diff;
			}

			if (!before) {
				before = '(empty)';
			}

			if (!after) {
				after = '(empty)';
			}

			diff += title + '\n';
			diff += '**before:**' + '\n';
			diff += '```' + before + '```\n';
			diff += '**after:**' + '\n';
			diff += '```' + after + '```\n';
			diff += '\n';
			return diff;
		};

		commands.forEach(command => {
			var commandDiff = '';

			var legend = command.querySelector('legend');

			commandDiff += getDiff('### output', command.querySelector('.output-before').value, command.querySelector('.output-after').value);
			commandDiff += getDiff('### notes', command.querySelector('.notes-before').value, command.querySelector('.notes-after').value);

			var results = command.querySelectorAll('fieldset');
			results.forEach(result => {
				var resultDiff = '';

				var legend = result.querySelector('legend');
				resultDiff += getDiff('### result', result.querySelector('.result-before').value, result.querySelector('.result-after').value);
				resultDiff += getDiff('### note', result.querySelector('.note-before').value, result.querySelector('.note-after').value);

				if (resultDiff) {
					resultDiff = 'key: '+result.querySelector('.result-key').value+'\n\n'+resultDiff;
					resultDiff = '### result for '+legend.innerText+'\n\n'+resultDiff;
				}

				// bubble up
				commandDiff += resultDiff;
			});

			if (commandDiff) {
				commandDiff = '## '+legend.innerText+'\n' + 'Command used: `' + command.querySelector('.command').value + '`\n\n' + commandDiff;
			}

			// bubble up
			diff += commandDiff;
		});

		if (!diff) {
			diff = 'no changes (same results were confirmed)';
		}

		body += '\n\n'+diff;

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

