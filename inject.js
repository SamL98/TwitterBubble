// Remove tweets containing any of the given words from the DOM
var hideWords = function(words) {
	// map the words to hide to lowercase, so hiding is case-insensitive
	words = words.map(x => x.toLowerCase());

	// get the divs of all the tweets currently being displayed
	var tweetDivs = document.getElementsByClassName('js-tweet-text');	

	for (var i = 0; i < tweetDivs.length; i++) {
		var tweet = tweetDivs[i].innerHTML;

		// split the text of the tweet into words and strip all punctuation.
		// also convert every word to lowercase.
		var twWords = tweet.split(' ').map(x => {
			var lower = x.toLowerCase();
			return lower.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
		});

		for (var j = 0; j < words.length; j++) {

			// remove the tweet node if any of the words to hide is
			// contained in the words of the tweet
			if (twWords.includes(words[j])) {

				// the actual node of the tweet is 5 levels up in the DOM
				var child = tweetDivs[i];
				var par = tweetDivs[i].parentNode;
				for (var k = 0; k < 4; k++) {
					child = par;
					par = child.parentNode;
				}
				par.removeChild(child);
				break;
			}
		}
	}
}

var words = []
var wordsLoaded = false;

// check to see if the DOM has been loaded every 100ms
var interval = setInterval(() => {
	if (document.readyState === 'complete') {
	
		// listen for the extension global page to respond to our
		// dispatch with the words to hide
		safari.self.addEventListener('message', (msg) => {

			// don't hide the words again if they have already been loaded
			if (wordsLoaded) { return; }

			// only hide the words if the correct message type was received
			if (msg.name === 'Words') {
				wordsLoaded = true;
				words = msg.message;

				hideWords(words);

				var strCont = document.getElementById('stream-items-id');
				if (!strCont) { return; }
	
				var observer = new MutationObserver((mList) => {
					hideWords(words);
				});
				observer.observe(strCont, {childList: true});
			}
		}, false);

		// tell the global page to give us the words
		safari.self.tab.dispatchMessage('GetWords');

		// stop repeating this code block
		clearInterval(interval);
	}
}, 100);
