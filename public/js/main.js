var features;
var ATBrowsers;

var getJson = function(url, success, err) {
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.onload = function() {
		if (request.status >= 200 && request.status < 400) {
			success(JSON.parse(request.responseText));
		} else {
			// We reached our target server, but it returned an error
			err(request.status);
		}
	};
	request.onerror = err;
	request.send();
};

// Fetch all of the required data
getJson('/features.json', function(data) {
	features = data;
	getJson('ATBrowsers.json', function(data) {
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
	var link = document.createElement("A");
	var title = document.createElement("H2");
	link.href = '/tech/'+feature.techId + '/' + feature.id;
	link.textContent = feature.title;
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
		th.textContent = ATBrowsers.at[at].short_title;
		td.textContent = feature.core_support_by_at[at];
		headerRow.appendChild(th);
		row.appendChild(td);
	}

	thead.appendChild(headerRow);
	tbody.appendChild(row);
	table.appendChild(thead);
	table.appendChild(tbody);
	tableContainer.appendChild(table);

	container.appendChild(title);
	container.appendChild(tableContainer);

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

	form.addEventListener('submit', function(e) {
		e.preventDefault();
		e.stopPropagation();

		summary.focus();

		return false;
	});

	function showSearchResults(query) {
		//Empty the current results
		resultsContainer.innerHTML = '';
		summary.innerHTML = '';

		if (query.length === 0) {
			//No query was selected
			return;
		}

		var results = filterFeatures(query);

		if (!results.length) {
			summary.innerHTML = 'Sorry, no results could be found.';
			return;
		}

		summary.innerHTML = results.length + ' results found';

		//Repopulate
		for (let i = 0; i < results.length; i++) {
			resultsContainer.appendChild(buildResult(results[i]));
		}
	}

	input.addEventListener('input', function() {
		showSearchResults(this.value);
	});
}
