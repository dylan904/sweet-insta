var script = document.createElement('script');
script.src = "https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js";
document.getElementsByTagName('head')[0].appendChild(script);



function initSlideShow() {
    var slideTime = 6000;
    $('link[rel=stylesheet], style').remove();

    $('head').append('<link rel="stylesheet" type="text/css" href="https://rawgit.com/dylan904/sweet-insta/master/style.css">')

    $('body').append('<div id="slideshow" class="template-default layout-1" style="font-size: 150.8%;"><ul class="slides"></ul></div>');

    var postLinks = $$('article > div > div > div > div > a');
    var postImgs = $$('article > div > div > div > div > a > div > div > img');

    var searchHashtagRegex = /\#(jaxcakes)|(orlandocakes)|(jaxwedding)|(orlandowedding)|(wedding)|(cakestagram)/gi;
    var postIdRegex = /\/p\/(.+)\//;

    var postImg, postLink, postAlt, targetPosts = [];
    for (var pi = 0; pi < postLinks.length; ++pi) {
        postImg = postImgs[pi];
        postAlt = postImg.getAttribute('alt');
        if (postAlt.match(searchHashtagRegex)) {
            postLink = postLinks[pi];
            console.log(postLink);
            targetPosts.push(postLink.getAttribute('href').match(postIdRegex)[1]);
        }
    }
    var $slides = $('.slides');


    var xi = 0,
        si = 0;
    var $lastSlide, $newSlide, $nextSlide;

    window.setInterval(function() {
        var res, out;
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                res = JSON.parse(this.responseText).graphql['shortcode_media'];
                console.log(res);

                var comments = res["edge_media_to_comment"].edges;
                var commentString = '',
                    comment;
                for (var ci = 0; ci < comments.length; ++ci) {
                    comment = comments[ci].node;
                    commentString += '<div class="comment"><div class="comment-text"><span class="name">' + comment.owner.username + '</span> <span class="text">' + comment.text + '</span></div></div>'
                }
                var bgSize = (res.dimensions.width > 750) ? 'contain' : 'auto';

                out = '<li class="singlecard-transition transition-moveright slideid-a" data-transition="transition-moveright"><div class="slide ss-media layout-singleslide layout-singleslide-1 image-slide"><div class="asset pull-left"> <div class="slide-image-blurred-background" style="background-image: url(' + res['display_url'] + '); background-size: ' + bgSize + ';"></div><div class="slide-image" style="background-image: url(' + res['display_url'] + ');background-size: ' + bgSize + ';"></div> </div><div class="content-text slides-background-marker pull-left fixed-width"> <div class="author"> <img class="pull-left" src="test-avatar"> <div class="details pull-left"> <div class="name-container"><h2 class="name">sweetbyholly</h2></div><div class="posted-container"><span class="posted">2 years ago</span> on <i class="fab fa-instagram" aria-hidden="true"></i></div></div></div><div class="author-text"></div><div class="other"> <span class="likes"><i class="fas fa-heart" aria-hidden="true"></i> <span class="count">' + res['edge_media_preview_like'].count + '</span></span><span class="comments-info"><i class="fas fa-comments"></i> <span class="count">' + res['edge_media_to_comment'].count + '</span></span></div><div class="comments">' + commentString + '</div></div></div></li>';

                $newSlide = $(out).appendTo($slides);
                $lastSlide = $slides.children(':not(:last-child)');

                window.setTimeout(function() {
                    $lastSlide.addClass('transition');
                    $newSlide.addClass('current');

                    if ($lastSlide.length) {
                        $lastSlide.on('transitionend webkitTransitionEnd', function() {
                            $lastSlide.remove();
                        });
                    }
                }, 10);

            }
        };
        xhttp.open("GET", "/p/" + targetPosts[xi] + "/?__a=1", true);
        xhttp.send();
        if (xi == targetPosts.length - 2) {
            xi = 0;
        } else {
            ++xi;
        }
    }, slideTime);
}




function addXMLRequestCallback(callback) {
    var oldSend, i;
    if (XMLHttpRequest.callbacks) {
        XMLHttpRequest.callbacks.push(callback);
    } else {
        XMLHttpRequest.callbacks = [callback];
        oldSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = function() {
            for (i = 0; i < XMLHttpRequest.callbacks.length; i++) {
                XMLHttpRequest.callbacks[i](this);
            }
            oldSend.apply(this, arguments);
        }
    }
}

var instaHash;
addXMLRequestCallback(function(xhr) {
    console.dir('h2', xhr); // have a look if there is anything useful here
});




if (!instaHash) {
    window.scrollTo(0, 5000);
    setTimeout(initSlideshow, 3000);
} else {
    initSlideShow();
}