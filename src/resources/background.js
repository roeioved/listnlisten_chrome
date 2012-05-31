var playlist = new Playlist();

chrome.extension.onRequest.addListener(
    function (request, sender, sendResponse) {
        console.log(request);

        if (request.op == 'addVideo') {
            var video = new Video(request.id, request.title, request.duration);
            playlist.addVideo(video);
        }
        else if (request.op == 'removeVideo') {
            var id = request.id;
            playlist.removeVideo(id);
        }
        else if (request.op == 'clearPlaylist') {
            playlist.clear();
        }
        else if (request.op == 'getPlaylist') {
            var videos = playlist.get();
            var response = { videos: videos };
            sendResponse(response);
        }

        console.log('videos:' + playlist.get().length);
    }
);

function openPlayerTab() {
    chrome.tabs.query( {title:'List {n} Listen'}, function(tabs) {
        if (tabs && tabs.length > 0) {
            for (var idx in tabs) {
                var tab = tabs[idx];
                chrome.tabs.update(tab.id, {selected: true});
            }
        } else {
            chrome.tabs.create( {url: 'player.html'}, function(tab) {
                if (tab) {
                    //todo:store tab id
                }
            });
        }
    });
}

chrome.browserAction.onClicked.addListener(function(tab) {
    openPlayerTab();
});

// https://github.com/zuzara/facebook-connect-for-chrome-extension

var successURL = 'https://www.facebook.com/connect/login_success.html';

function onFacebookLogin() {
    if (!localStorage.accessToken) {
        chrome.tabs.query({}, function(tabs) {
            for (var i = 0; i < tabs.length; i++) {
                var tab = tabs[i];
                if (tab.url.indexOf(successURL) == 0) {
                    var params = tab.url.split('#')[1];
                    localStorage.accessToken = params;
                    chrome.tabs.onUpdated.removeListener(onFacebookLogin);
                    chrome.tabs.remove(tab.id);
                    return;
                }
            }
        });
    }
}
chrome.tabs.onUpdated.addListener(onFacebookLogin);