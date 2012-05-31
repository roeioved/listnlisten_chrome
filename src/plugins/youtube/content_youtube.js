function youtubeExtractId(url) {
    var reg = new RegExp('v=([^&]*)');
    var matches = reg.exec(url);
    if (matches == null || matches.length < 2)
        return null;
    else    
        return matches[1];
}

function addVideo(id) {
    var request = { op: 'addVideo', id: id };
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
        addVideo(id);
    }
});