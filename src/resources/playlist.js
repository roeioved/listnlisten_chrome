function Video(id, title, duration) {
    this.id = id;
    this.title = title;
    this.duration = duration;
}

Video.prototype = {

}

function Playlist() {
    this._videos = [];
}

Playlist.prototype = {
    
    get: function () {
        return this._videos;
    },
    
    addVideo: function (video) {
        var videos = this._videos;
        for (var idx in videos) {
            if (videos[idx].id == video.id)
                return false;
        }
        this._videos.push(video);
        return true;
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