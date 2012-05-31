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
            chrome.tabs.create( {url:'player.html'}, function(tab) {
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

/*
// https://github.com/zuzara/facebook-connect-for-chrome-extension
// http://code.google.com/chrome/extensions/tut_oauth.html

var successURL = 'https://www.facebook.com/connect/login_success.html';

function onFacebookLogin() {
    if (!localStorage.accessToken) {
        chrome.tabs.getCurrent(function(tab) {
            if (tab.url.indexOf(successURL) == 0) {
                var params = tab.url.split('#')[1];
                console.log(params);
                localStorage.accessToken = params;
                chrome.tabs.onUpdated.removeListener(onFacebookLogin);
                return;
            }
        });
//        chrome.tabs.getAllInWindow(null, function(tabs) {
//            for (var i = 0; i < tabs.length; i++) {
//                if (tabs[i].url.indexOf(successURL) == 0) {
//                    var params = tabs[i].url.split('#')[1];
//                    console.log(params);
//                    localStorage.accessToken = params;
//                    chrome.tabs.onUpdated.removeListener(onFacebookLogin);
//                    return;
//                }
//            }
//        });
    }
}
chrome.tabs.onUpdated.addListener(onFacebookLogin);
*/