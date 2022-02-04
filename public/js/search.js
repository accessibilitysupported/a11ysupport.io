// Fetch all of the required data
initSearch();
var allResults = document.querySelectorAll('.search-results .result');

/**
 * Array filters items based on search criteria (query)
 */
function filterFeatures(query) {
	if (!query) {
		// Show everything
		for (var i = 0; i < allResults.length; i++) {
			allResults[i].removeAttribute('hidden');
		}
		return;
	}

	for (var i = 0; i < allResults.length; i++) {
		if (allResults[i].getAttribute('data-keywords').toLowerCase().indexOf(query.toLowerCase()) === -1) {
			allResults[i].setAttribute('hidden', '');
		} else {
			allResults[i].removeAttribute('hidden');
		}
	}
}

function initSearch() {
	var searchContainer = document.querySelector('.search-container');
	if (!searchContainer) {
		return;
	}
	var form = searchContainer.querySelector('form');
	var input = searchContainer.querySelector('input.search');
	var summary = searchContainer.querySelector('.summary-container');
	var heading = searchContainer.querySelector('h1');
	var liveAnnouncementsPolite = searchContainer.querySelector('.live-announcements-polite');
	var liveAnnouncementsAssertive = searchContainer.querySelector('.live-announcements-assertive');
	var liveTimeoutId;
	var lastResultsLength = 1;

	form.addEventListener('submit', function(e) {
		e.preventDefault();
		e.stopPropagation();

		heading.focus();

		return false;
	});

	/**
	 * Set up a separate aria-live region to announce results. Because results are populated on each keypress, we need to rate limit the announcement of results so as to not make the screen reader output too verbose.
	 * @param string
	 */
	function setLiveResultNotification(string, assertive) {
		// set which region we are targeting
		let region = liveAnnouncementsPolite;
		if (assertive) {
			region = liveAnnouncementsAssertive
		}

		// announce it
		region.innerHTML = string;

		//Now... set a timeout to clear the contents
		window.setTimeout(function() {
			region.innerHTML = '';
		}, 2000);
	}

	function showSearchResults(query) {
		//Empty the current results
		summary.innerHTML = '';

		filterFeatures(query);

		var results = document.querySelectorAll('.search-results .result:not([hidden])');

		if (!results.length) {
			var string = 'Sorry, no results could be found.';
			summary.innerHTML = string;
			if (lastResultsLength > 0) {
				setLiveResultNotification(string, true);
			}

			lastResultsLength = results.length;
			return;
		}

		if (lastResultsLength === 0 && results.length > 0) {
			setLiveResultNotification("results found");
		}

		lastResultsLength = results.length;

		if (query) {
			summary.innerText = results.length + ' results found for ' + query;
		} else {
			summary.innerText = results.length + ' results found';
		}
	}

	input.addEventListener('input', function() {
		showSearchResults(this.value);
	});
}
