var playlist = new Playlist();

function handleRequest(request, sendResponse) {
    if (request.op == 'addVideo') {
        var id = request.id;
        var video = playlist.addVideo(id);
        $('#playlist').append('<li class="video" id="' + video.id + '">' + video.id + ' => ' + video.title + '</li>');
    }
    else if (request.op == 'clearPlaylist') {
        playlist.clear();
        $('#playlist').html();
    }
}

function clearPlaylist() {
    var request = { op: 'clearPlaylist' };
    chrome.extension.sendRequest(request);
}

function getPlaylist() {
    var request = { op: 'getPlaylist' };
    
    chrome.extension.sendRequest(request, function(response) {
        if (response && response.videos && response.videos.length > 0) {
            var videos = response.videos;
            
            for (var idx in videos) {
                var video = videos[idx];
                playlist.addVideo(video.id);
            }
        }
    });
}

var lastVideos = [];

function isShuffle() {
    return shuffle = $("#play_modes li.shuffle").attr('value');
}

function isRepeat() {
    return repeat = $("#play_modes li.repeat").attr('value');
}

function getPlayerState() {
    return $('#player').tubeplayer('data').state;
}

function getCurrentPlaying() {
    return $('li.video.playing').attr('id');
}

function playerPlay() {
    var id = getCurrentPlaying();
    
    if(!id) {
        if($("li.video").length > 0) {            
            id = $("li.video").first().attr('id');
        }
    }
    
    $('#player').tubeplayer('play', id);
    
    $('li.video').removeClass('playing').filter('[id="' + id + '"]').addClass('playing');
    
    var video = $('li.video').filter('[id="' + id + '"]');
    video.removeClass('not-played').removeClass('played').addClass('played');
    //var title = video.attr('title');
    //title = (title.length < 80 ? title : title.substr(0, 80) + "...");
    //$('#video-title').html(title);
    
    if (isShuffle()) {
        lastVideos.push(id);
    }
    
    var icon = 'http://i.ytimg.com/vi/' + id + '/1.jpg';
}

function playerPause() {
    $('#player').tubeplayer("pause");
}

function playerStop() {
    $('#player').tubeplayer("stop");
}

function playerNext() {
    var next;
    
    if ($("li.video").length > 0 && $("li.video").length == $("li.video.played").length) {
        $("li.video").removeClass('played').removeClass('not-played').addClass('not-played');
    }

    if (isShuffle() == true) {
        next = $("li.video.not-played:random").attr('id');
        
        if(next == undefined){
            next = $("li.video.not-played").first().attr('id');
        }
    } else {
        next = $("li.video.playing").nextUntil('ul').attr('id');            
    }

    if (next != undefined) {
        $("li.video").removeClass("playing").filter('[id="' + next + '"]').addClass("playing");
    } else {
        if (isRepeat() == true) {
            $("li.video").removeClass("playing").first().addClass("playing");
            next = $("li.video.not-played").first().attr('id');
        }
    }

    if (next)
        playerPlay();
}

function playerPrev() {
    var prev;
    
    if (isShuffle() == true) {            
        if (lastVideos.length > 0) {
            lastVideos.pop(); // Pops current video
            prev = lastVideos.pop();                
        }
    } else {
        prev = $("li.video.playing").prevUntil('ul').attr('id');
    }
    
    if (prev != undefined) {
        $("li.video").removeClass("playing").filter('[id="' + prev + '"]').addClass("playing");
        playerPlay();
    }
}

function playByID(id) {
    $("li.video").removeClass("playing").filter('[id="' + id + '"]').addClass("playing");
    playerPlay();
}

function removeVideo(id) {
    var video = $("li.video").filter('[id="' + id + '"]');
    
    if (video) {
        if (id == getCurrentPlaying())
            playerNext();
    }
}

function loadVideoDetails(item, id) {
    var url = "http://gdata.youtube.com/feeds/api/videos/" + id + "?key=" + key + "&format=5&alt=json";

    var perm = item.attr('permission');
    var user = item.attr('user');
    var user_img = 'http://graph.facebook.com/' + user + '/picture';
    
    item.removeClass('new').removeClass('error').addClass('loading');
    
    var result = [];

    $.ajax({
        url: url,
        timeout: 10000,
        dataType: 'json',
        success: function(data, textStatus, jqXHR){                
            var entity = data.entry;
            var title = item.attr('title') || entity.title.$t
            title = title.replace(/'/gi, '').replace(/"/gi, '');
            var published = timeago(entity.published.$t);
            var state = entity.app$control || null;
            
            if(state == null)
                state = true;
            else
                if(state.yt$state && state.yt$state.name && state.yt$state.name.length && state.yt$state.reasonCode != 'limitedSyndication')
                    state = false;
                else
                    state = true;
                
            if(!state) {
                var thumb = __SITE_URL + 'content/images/no-video.jpg';
                
                result[0] = "<div class='preview'><img src='" + thumb + "' alt='" + title + "' title='" + title + "' /></div>";
                result[1] = "<div class='info'>";
                result[2] = "<span class='title'><a title='" + title + "' href='#' rel='" + id + "'>" + title + "</a></span>";
                result[3] = "</div>";
                result[4] = "</div>";
            } else {
                var thumb = entity.media$group.media$thumbnail[1].url;       			    
                
                var duration = entity.media$group.yt$duration.seconds;
                var seconds = parseInt(duration%60);
                var minutes = parseInt(duration/60%60);
                var hours = parseInt(duration/60/60);
                seconds = seconds < 10 ? "0" + seconds : seconds;
                minutes = hours > 0 && minutes < 10 ? "0" + minutes : minutes;
                duration = (hours > 0 ? hours + ':' : '') + minutes + ':' + seconds;
                
                var viewCount = entity.yt$statistics.viewCount;
                viewCount = (typeof viewCount == "undefined" ? "0" : viewCount);
                
                result[0] = "<div class='preview'><img src='" + thumb + "' alt='" + title + "' title='" + title + "' /></div>";
                result[1] = "<div class='info'>";
                result[2] = "<span class='title'><a title='" + title + "' href='#' rel='" + id + "'>" + title + "</a></span>";
                result[3] = "<div class='clearboth'></div>";
                result[4] = "<div class='stats'>";
                result[5] = "<span class='time'>" + duration + "</span>";
                result[6] = "<span class='views'>" + formatNumber(viewCount) + "</span>";
                result[7] = "<span class='date'>" + published + "</span>";
                result[8] = "</span>"
                result[9] = "</div>";
                result[10] = "</div>";
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            var title = item.attr('title');
            if (title) {
                title = title.replace(/'/gi, "").replace(/"/gi, "");
            } else {
                title = "Please wait...";
            } 
            
            var thumb = 'http://i.ytimg.com/vi/' + id + '/1.jpg';
            result[0] = "<div class='preview'><img src='" + thumb + "' alt='" + title + "' title='" + title + "' /></div>";
            result[1] = "<div class='info'>";
            result[2] = "<span class='title'><a title='" + title + "' href='#' rel='" + id + "'>" + title + "</a></span>";
            result[3] = "</div>";
            //result[3] = "<img src='<?php echo __SITE_URL; ?>content/images/loading.gif' />";
            
            item.addClass("error");
            
            if (textStatus != 'timeout') {
                //removeVideo(id);
            } else {                    
            }
        },
        complete: function(jqXHR, textStatus){
            item.removeClass('loading');
            
            var index = result.length;
            result[index++] = "<div class='actions'>";
            result[index++] = "<span class='delete'>&nbsp;</span>";
            //result[index++] = "<span class='edit'>&nbsp;</span>";
            //result[index++] = "<span class='like'>&nbsp;</span>";
            result[index++] = "</div>";
            
            var content = result.join('');
            
            item.hide().html(content).show();
        }
    });
}

$(document).ready(function() {
    $('#player').tubeplayer({
        playerID: 'youtube-player', // the ID of the embedded youtube player
        width: 640, // the width of the player
        height: 480, // the height of the player
        allowFullScreen: 'true', // true by default, allow user to go full screen
        initialVideo: '', // the video that is loaded into the player
        start: 0,
        preferredQuality: 'hd720',// preferred quality: default, small, medium, large, hd720
        showControls: 1, // whether the player should have the controls visible, 0 or 1
        showRelated: 0, // show the related videos when the player ends, 0 or 1 
        autoPlay: 0, // whether the player should autoplay the video, 0 or 1
        autoHide: false,
        theme: 'dark', // possible options: "dark" or "light"
        color: 'white', // possible options: "red" or "white"
        showinfo: true, // if you want the player to include details about the video
        modestbranding: true, // specify to include/exclude the YouTube watermark
        // flash
        wmode: 'transparent', // note: transparent maintains z-index, but disables GPU acceleration
        swfobjectURL: 'http://ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js',
        loadSWFObject: true, // if you include swfobject, set to false
        // html5
        iframed: true, // iframed can be: true, false; if true, but not supported, degrades to flash
        // player events
        onPlay: function(id){}, // after the play method is called
        onPause: function(){}, // after the pause method is called
        onStop: function(){}, // after the player is stopped
        onSeek: function(time){}, // after the video has been seeked to a defined point
        onMute: function(){}, // after the player is muted
        onUnMute: function(){}, // after the player is unmuted
        // state events
        onPlayerUnstarted: function(){}, // when the player returns a state of unstarted
        onPlayerEnded: function(){ playerNext(); }, // when the player returns a state of ended
        onPlayerPlaying: function(){}, // when the player returns a state of playing
        onPlayerPaused: function(){ }, // when the player returns a state of paused
        onPlayerBuffering: function(){}, // when the player returns a state of buffering
        onPlayerCued: function(){}, // when the player returns a state of cued
        onQualityChange: function(quality){}, // a function callback for when the quality of a video is determined
        // error events
        onErrorNotFound: function(){ /*var id = youtubeExtractId($('#player').tubeplayer('data').videoURL);*/ playerNext(); /*removeVideo(id);*/ }, // if a video cant be found
        onErrorNotEmbeddable: function(){ /*var id = youtubeExtractId($('#player').tubeplayer('data').videoURL);*/ playerNext(); /*removeVideo(id);*/ }, // if a video isnt embeddable
        onErrorInvalidParameter: function(){} // if we've got an invalid param
    });

    $.tubeplayer.defaults.afterReady = function($player) {
        $('#player').removeClass('loading');
        playerPlay();
    }
    
    /* Playlist */
    $('li.video').live('click', function() {
        var id = $(this).attr('id');
        playByID(id);
    });
    
    /* Controls */    
    $('#play_controls li.play').live('click', function() {
        playerPlay();
    });
    $('#play_controls li.pause').live('click', function() {
        playerPause();
    });
    $('#play_controls li.stop').live('click', function() {
        playerStop();
    });
    $('#play_controls li.prev').live('click', function() {
        playerPrev();
    });
    $('#play_controls li.next').live('click', function() {
        playerNext();
    });

    /* Play Mode */
    $("#play_modes li.shuffle").toggle(function(){
        $(this).removeClass('off').addClass('on');
        $(this).attr('value', '1');
        lastVideos = [];
        var id = getCurrentPlaying();
        if (id) lastVideos.push(id);
    }, function () {
        $(this).removeClass('on').addClass('off');
        $(this).attr('value', '0');            
    }); 
    $("#play_modes li.repeat").toggle(function(){
        $(this).removeClass('off').addClass('on');
        $(this).attr('value', '1');
    }, function () {
        $(this).removeClass('on').addClass('off');
        $(this).attr('value', '0');
    });
});