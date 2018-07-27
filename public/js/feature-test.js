var test;
var ATBrowsers;

function initTestingPrefForm()
{
	var form = document.querySelector('form.testing-pref');
	form.addEventListener('submit', function(e) {
		e.preventDefault();
		e.stopPropagation();

		var select = form.querySelector('select');
		var choice = select.value;
		choice = choice.split('/');

		localStorage.setItem('at', choice[0]);
		localStorage.setItem('browser', choice[1]);

		displayTestingPrefs(true);
	});
}

function displayTestingPrefs(focusResults)
{
	var at = localStorage.getItem('at');
	var browser = localStorage.getItem('browser');

	if (!at || !browser) {
		// Settings haven't been saved yet.
		return;
	}

	var resultsContainer = document.querySelector('#testing-pref-results');

	var dl = document.createElement('dl');
	var dt = document.createElement('dt');
	dt.innerText = 'Selected combination';
	var dd = document.createElement('dd');
	dd.innerText = ATBrowsers.at[at].short_title  + ' / ' + ATBrowsers.browsers[browser].title;
	dl.appendChild(dt);
	dl.appendChild(dd);

	var supportPoint = test.at[at].browsers[browser];

	var dt = document.createElement('dt');
	dt.innerText = 'Current support';
	var dd = document.createElement('dd');
	dd.innerText = supportPoint.support;
	dl.appendChild(dt);
	dl.appendChild(dd);

	if (supportPoint.output && supportPoint.output !== '') {
		var dt = document.createElement('dt');
		dt.innerText = 'Previous output';
		var dd = document.createElement('dd');
		dd.innerText = supportPoint.output;
		dl.appendChild(dt);
		dl.appendChild(dd);
	}

	var dt = document.createElement('dt');
	dt.innerText = 'Helpful Links';
	var dd = document.createElement('dd');
	var a = document.createElement('a');
	a.setAttribute('href', '/learn/at/'+at);
	a.innerText = 'Learn how to use ' + ATBrowsers.at[at].short_title;
	dd.appendChild(a);
	dl.appendChild(dt);
	dl.appendChild(dd);


	var heading = document.createElement('h4');
	heading.innerText = 'Some helpful information based on your selection';
	heading.setAttribute('tabindex', '-1');

	resultsContainer.innerHTML = '';
	resultsContainer.appendChild(heading);
	resultsContainer.appendChild(dl);
	resultsContainer.classList.add('call-out');

	if (focusResults) {
		heading.focus();
	}

	// Now set form inputs
	var atOption = document.querySelector('#at option[value="'+at+'"]');
	atOption.setAttribute('selected', '');
	var browserOption = document.querySelector('#browser option[value="'+browser+'"]');
	browserOption.setAttribute('selected', '');
}


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



	form.addEventListener('submit', function(e) {
		e.preventDefault();
		e.stopPropagation();

		var data = new FormData(e.target);

		var url = 'https://github.com/accessibilitysupported/accessibilitysupported/issues/new?title=';
		var title = data.get('title') + ' ' + data.get('at') + '/' + data.get('browser');
		url += encodeURIComponent(title);

		var body = '| property | value |\n';
		body += '| --- | --- |\n';
		body += '| support | ' + data.get('support') + ' |\n';
		body += '| at | ' + data.get('at') + ' |\n';
		body += '| at_version | ' + data.get('at_version') + ' |\n';
		body += '| browser | ' + data.get('browser') + ' |\n';
		body += '| browser_version | ' + data.get('browser_version') + ' |\n';
		body += '| os_version: | ' + data.get('os_version') + ' |\n';
		body += '| output: | ' + data.get('output') + ' |\n';

		var notes = data.get('notes');
		if (notes) {
			body += '\n\n'+encodeURIComponent(notes)+'\n';
		}

		url += '&body='+encodeURIComponent(body);

		window.location = url;
	});
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

