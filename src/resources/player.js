var playlist = new Playlist();

function videoItem(id, title) {
    //return "<li class='video' id='" + id + "'>" + title + "<span class='actions delete'></span><span class='actions like'></span>" + "</li>";
    return "<li class='video' id='" + id + "'>" + title + "<span class='actions delete'></span>" + "</li>";
}

function handleRequest(request, sendResponse) {
    if (request.op == 'addVideo') {
        var video = new Video(request.id, request.title, request.duration);
        if (playlist.addVideo(video)) {
            var item = videoItem(video.id, video.title);
            $('#playlist').append(item);
            
            var player_state = getPlayerState();
            var num_of_videos = $("li.video").length;
            if (num_of_videos == 1 || player_state == -1) {
                playerPlay();
            }
        }
    }
}

function removeVideo(id) {
    var request = { op: 'removeVideo', id: id };
    chrome.extension.sendRequest(request);

    if (playlist.removeVideo(id)) {
        var video = $("li.video").filter('[id="' + id + '"]');

        if (video) {
            if (id == getCurrentPlaying()) {
                var num_of_videos = $("li.video").length;
                if (num_of_videos == 1)
                    initVideo();
                else
                    playerNext();
            }

            $("li.video").filter('[id="' + id + '"]').remove();
        }
    }
}

function clearPlaylist() {
    var request = { op: 'clearPlaylist' };
    chrome.extension.sendRequest(request);

    playlist.clear();
    $('#playlist').empty();
    initVideo();
}

function initVideo() {
    $('#player').tubeplayer('play', '?');
}

function getPlaylist() {
    var request = { op: 'getPlaylist' };
    
    chrome.extension.sendRequest(request, function(response) {
        if (response && response.videos && response.videos.length > 0) {
            var videos = response.videos;
            
            for (var idx in videos) {
                var video = videos[idx];
                playlist.addVideo(video);
                var item = videoItem(video.id, video.title);
                $('#playlist').append(item);
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
    
    if (!id) {
        if ($("li.video").length > 0) {
            id = $("li.video").first().attr('id');
        }
    }
    
    $('#player').tubeplayer('play', id);
    //$('#player').tubeplayer('play', { id: id, time: 100 } );

    $('li.video').removeClass('playing').filter('[id="' + id + '"]').addClass('playing');
    
    var video = $('li.video').filter('[id="' + id + '"]');
    video.removeClass('not-played').removeClass('played').addClass('played');

    if (isShuffle()) {
        lastVideos.push(id);
    }
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
        
        if(next == undefined) {
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
        onPlay: function(id) {
            if (CHANNEL && ON_AIR) {
                var action = { sender: CHANNEL, op: 'play', id: id };
                publish(CHANNEL, action);
            }
        }, // after the play method is called
        onPause: function() {
            if (CHANNEL && ON_AIR) {
                var action = { sender: CHANNEL, op: 'pause' };
                publish(CHANNEL, action);
            }
        }, // after the pause method is called
        onStop: function() {
            if (CHANNEL && ON_AIR) {
                var action = { sender: CHANNEL, op: 'stop' };
                publish(CHANNEL, action);
            }
        }, // after the player is stopped
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

    /* Play Modes */
    $("#play_modes li.shuffle").toggle(function() {
        $(this).removeClass('off').addClass('on');
        $(this).attr('value', '1');
        lastVideos = [];
        var id = getCurrentPlaying();
        if (id) lastVideos.push(id);
    }, function () {
        $(this).removeClass('on').addClass('off');
        $(this).attr('value', '0');            
    }); 
    $("#play_modes li.repeat").toggle(function() {
        $(this).removeClass('off').addClass('on');
        $(this).attr('value', '1');
    }, function () {
        $(this).removeClass('on').addClass('off');
        $(this).attr('value', '0');
    });

    /* Playlist Actions */
    $('#playlist_actions li.clear').live('click', function() {
        clearPlaylist();
    });

    /* Video Actions */
    $("li.video").live({
        mouseenter: function() {
            $(this).find('.actions').show();
        },
        mouseleave: function() {
            $(this).find('.actions').hide();
        }
    });
    $('li.video .like').live('click', function() {
        var id = $(this).parents('li').filter(':first').attr('id');
        return false;
    });
    $('li.video .delete').live('click', function() {
        var id = $(this).parents('li').filter(':first').attr('id');
        removeVideo(id);
        return false;
    });
});