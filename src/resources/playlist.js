function Video(id) {
    this.id = id;
    
    this._load();
}

Video.prototype = {
    
    _load: function() {
        jQTubeUtil.video(this.id, function(response) {
            if (response && response.videos && response.videos.length == 1) {
                var video = response.videos[0];
                this.title = video.title;
                this.duration = video.duration;
            }
        });
    }
    
}

function Playlist() {
    this._videos = [];
}

Playlist.prototype = {
    
    get: function () {
        return this._videos;
    },
    
    addVideo: function (id) {
        var video = new Video(id);
        this._videos.push(video);
        return video;
    },
    
    clear: function () {
        this._videos = [];
    }
    
};