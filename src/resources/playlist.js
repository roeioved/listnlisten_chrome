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
        var videos = this._videos;
        for (var idx in videos) {
            if (videos[idx].id == id)
                return null;
        }

        var video = new Video(id);
        this._videos.push(video);
        return video;
    },

    removeVideo: function (id) {
        var videos = this._videos;
        for (var idx in videos) {
            if (videos[idx].id == id) {
                videos.splice(idx, 1);
                return true;
            }
        }
        return false;
    },

    clear: function () {
        this._videos = [];
    }
    
};