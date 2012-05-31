//window.yt.player.playerReferences_.player1.api

function youtubeExtractId(url) {
    var reg = new RegExp('v=([^&]*)');
    var matches = reg.exec(url);
    if (matches == null || matches.length < 2)
        return null;
    else    
        return matches[1];
}

function addVideo(id, title, duration) {
    var request = { op: 'addVideo', id: id, title: title, duration: duration };
    chrome.extension.sendRequest(request);
}

var thumb_elem = '<a class="listnlisten_thumb_add" href="#" style="display:none;" title="Play @ List {n} Listen">+</a>';
$('.ux-thumb-wrap').append(thumb_elem);
$('.ux-thumb-wrap').hover(
    function() { $(this).children(".listnlisten_thumb_add").show(); },
    function() { $(this).children(".listnlisten_thumb_add").hide(); }
);

$('.listnlisten_thumb_add').live('click', function(e) {
    e.preventDefault();

    var url = $(this).parent().attr('href');
    var id = youtubeExtractId(url);
    
    if (id) {
        jQTubeUtil.video(id, function(response) {
            if (response && response.videos && response.videos.length == 1) {
                var video = response.videos[0];

                var title = video.title;
                var duration = video.duration;

                addVideo(id, title, duration);
            }
        });
    }
});

function isVideoRestricted(id) {
    var url = "http://gdata.youtube.com/feeds/api/videos/" + id + "?format=5&alt=json";

    $.ajax({
        url: url,
        timeout: 2000,
        dataType: 'json',
        success: function(data, textStatus, jqXHR) {
            var entity = data.entry;
            var state = entity.app$control || null;

            if (state == null)
                state = true;
            else
            if (state.yt$state && state.yt$state.name && state.yt$state.name.length && state.yt$state.reasonCode != 'limitedSyndication')
                state = false;
            else
                state = true;

            if(!state) {
                // restricted?
            } else {
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
        },
        complete: function(jqXHR, textStatus) {
        }
    });
}