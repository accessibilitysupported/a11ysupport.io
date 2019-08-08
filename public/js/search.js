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
		if (allResults[i].getAttribute('data-keywords').indexOf(query.toLowerCase()) === -1) {
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

	function showSearchResults(query, disableLiveAnnouncements) {
		//Empty the current results
		summary.innerHTML = '';

		if (query.length === 0 && !disableLiveAnnouncements) {
			//No query was selected
			setLiveResultNotification('Showing all features');
		}

		filterFeatures(query);

		var results = document.querySelectorAll('.search-results .result:not([hidden])');

		if (!results.length) {
			var string = 'Sorry, no results could be found.';
			summary.innerHTML = string;
			if (!disableLiveAnnouncements) {
				setLiveResultNotification(string);
			}

			return;
		}

		var string = results.length + ' results found';
		summary.innerHTML = string;

		if (!disableLiveAnnouncements) {
			setLiveResultNotification(string);
		}
	}

	input.addEventListener('input', function() {
		showSearchResults(this.value);
	});

	// Show everything by default
	//showSearchResults('', true);
}
