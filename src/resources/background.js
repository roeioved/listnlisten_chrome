var playlist = new Playlist();

chrome.extension.onRequest.addListener(
    function (request, sender, sendResponse) {
        if (request.op == 'addVideo') {
            var id = request.id;
            var video = playlist.addVideo(id);
        }
        else if (request.op == 'clearPlaylist') {
            playlist.clear();
        }
        else if (request.op == 'getPlaylist') {
            var response = { videos: playlist.get() };
            sendResponse(response);
        }
    }
);