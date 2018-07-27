var features;
var ATBrowsers;

// Fetch all of the required data
getJson('/features.json', function(data) {
	features = data;
	getJson('/ATBrowsers.json', function(data) {
		ATBrowsers = data;

		// Now that we have the data, init search
		initSearch();
	});
});

/**
 * Array filters items based on search criteria (query)
 */
function filterFeatures(query) {
	return features.filter(function(feature) {
		return feature.title.toLowerCase().indexOf(query.toLowerCase()) > -1;
	})
}

function buildResult(feature) {
	var container = document.createElement("DIV");
	container.classList.add('result');
	var link = document.createElement("A");
	var title = document.createElement("H2");
	link.href = '/tech/'+feature.techId + '/' + feature.id;
	link.textContent = feature.title + ' (' + feature.techId + ')';
	title.appendChild(link);


	var tableContainer = document.createElement("DIV");
	tableContainer.classList.add('responsive-table');
	var table = document.createElement("TABLE");
	var thead = document.createElement("THEAD");
	var tbody = document.createElement("TBODY");

	var headerRow = document.createElement("TR");
	var row = document.createElement("TR");
	for(var at in feature.core_support_by_at) {
		var th = document.createElement("TH");
		var td = document.createElement("TD");
		var supportClass = feature.core_support_by_at[at].string.replace(" ", "-");
		th.textContent = ATBrowsers.at[at].short_title;
		th.classList.add(supportClass);
		td.textContent = feature.core_support_by_at[at].string;
		td.classList.add(supportClass);
		headerRow.appendChild(th);
		row.appendChild(td);
	}

	thead.appendChild(headerRow);
	tbody.appendChild(row);
	table.appendChild(thead);
	table.appendChild(tbody);
	tableContainer.appendChild(table);

	var details = document.createElement('P');
	details.appendChild(document.createTextNode('Supported by ' + feature.total_test_count + ' tests. '));
	if (feature.core_support.includes('u')) {
		details.appendChild(document.createTextNode('We are missing data on some combinations.'));
	}

	container.appendChild(title);
	container.appendChild(tableContainer);
	container.appendChild(details);


	return container;
}

function initSearch() {
	var searchContainer = document.querySelector('.search-container');
	if (!searchContainer) {
		return;
	}
	var form = searchContainer.querySelector('form');
	var input = searchContainer.querySelector('input.search');
	var summary = searchContainer.querySelector('.summary-container');
	var resultsContainer = searchContainer.querySelector('.search-results');
	var liveAnnouncements = searchContainer.querySelector('.live-announcements');
	var liveTimeoutId;

	form.addEventListener('submit', function(e) {
		e.preventDefault();
		e.stopPropagation();

		summary.focus();

		return false;
	});

	/**
	 * Set up a separate aria-live region to announce results. Because results are populated on each keypress, we need to rate limit the announcement of results so as to not make the screen reader output too verbose.
	 * @param string
	 */
	function setLiveResultNotification(string) {
		//Stop a previously pending announcement
		if (liveTimeoutId) {
			window.clearTimeout(liveTimeoutId);
		}

		liveTimeoutId = window.setTimeout(function() {
			liveAnnouncements.innerHTML = string;

			//Now... set a timeout to clear the contents
			liveTimeoutId = window.setTimeout(function() {
				liveAnnouncements.innerHTML = '';
			}, 2000);
		}, 750);
	}

	function showSearchResults(query) {
		//Empty the current results
		resultsContainer.innerHTML = '';
		summary.innerHTML = '';

		if (query.length === 0) {
			//No query was selected
			setLiveResultNotification('results cleared');
			return;
		}

		var results = filterFeatures(query);

		if (!results.length) {
			var string = 'Sorry, no results could be found.';
			summary.innerHTML = string;
			setLiveResultNotification(string);
			return;
		}

		var string = results.length + ' results found';
		summary.innerHTML = string;
		setLiveResultNotification(string);

		//Repopulate
		for (var i = 0; i < results.length; i++) {
			resultsContainer.appendChild(buildResult(results[i]));
		}
	}

	input.addEventListener('input', function() {
		showSearchResults(this.value);
	});
}
