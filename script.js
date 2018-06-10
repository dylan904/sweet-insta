// ==UserScript==
// @name       instaSlideshow
// @namespace  http://use.i.E.your.homepage/
// @version    0.4
// @description  enter something useful
// @copyright  2012+, You
// @include        https://www.instagram.com*
// @run-at document-start
// @grant unsafeWindow
// @require    http://code.jquery.com/jquery-1.11.1.min.js
// ==/UserScript==
var instaHash = '42323d64886122307be10013ad2dcc44',
    targetPosts = [],
    instaAfter,
    slideI = 0,
    slidesReady = false,
    slideTime = 6000,
    $newSlide, $lastSlide, $slides,
    searchHashtagRegex = /\#((jaxcakes)|(orlandocakes)|(jaxwedding)|(orlandowedding)|(wedding)|(cakestagram))/gi,
    //to1 = '/graphql/query/?query_hash=' + instaHash + '&variables=%7B%22id%22%3A%22175787939%22%2C%22first%22%3A50%7D',
    //to2 = '/graphql/query/?query_hash=' + instaHash + '&variables=%7B%22id%22%3A%22175787939%22%2C%22first%22%3A50%2C%22after%22%3A%22AQBHnIP1bMNUnGw_dpnGhCxpA9HpSDE3ZW4U1ZJHxOkJPz7LYrc8Pr-jkkjA8s93wRZ-R_QmDr0PcavR8ao4v_eOvlrOv2Vd9-0r7JAXPC1A6w%22%7D',
    // t1 = encodeURI('/graphql/query/?query_hash=' + instaHash + '&variables={"id":"175787939","first":50}'),
    // t2 = encodeURI('/graphql/query/?query_hash=' + instaHash + '&variables={"id":"175787939","first":50,"after":"' + instaAfter + '"}'),
    fetchCt = 0;


var btn = document.createElement('button');
btn.innerHTML = 'Start Slideshow';
btn.style.position = 'fixed';
btn.style.top = '12px';
btn.style.left = '50px';
btn.style.zIndex = '9999';
btn.onclick = initApp;
document.body.appendChild(btn);

function initApp() {
aget(encodeURI('/graphql/query/?query_hash=' + instaHash + '&variables={"id":"175787939","first":50}'), initQueryCB, initQueryError);

    $('link[rel=stylesheet], style').remove();
    $('head').append('<link rel="stylesheet" type="text/css" href="https://rawgit.com/dylan904/sweet-insta/master/style.css">');
    $('body').append('<div id="slideshow" class="template-default layout-1" style="font-size: 150.8%;"><ul class="slides"></ul></div>');
    $slides = $('.slides');
}


(function() {
    'use strict';

})();

function queryError() {
    console.log('error w/ ajax!');
}

function queryCB(xhr) {
    ++fetchCt;
    console.log('Nice.', xhr);
    var data = JSON.parse(xhr.responseText).data.user.edge_owner_to_timeline_media;
    var pageInfo = data.page_info;
    var hasNextPage = pageInfo.has_next_page;
    if (hasNextPage && fetchCt < 11) {
        instaAfter = pageInfo.end_cursor;
        window.setTimeout(function() {
            aget(encodeURI('/graphql/query/?query_hash=' + instaHash + '&variables={"id":"175787939","first":50,"after":"' + instaAfter + '"}'), queryCB, queryError);
        }, 10000);
    }

    var post, captions, caption, bgSize;
    var posts = data.edges;
    var postLen = posts.length;
    console.log('# of posts in request', postLen);
    for (var pi = 0; pi < postLen; ++pi) {
        post = posts[pi].node;
        captions = post.edge_media_to_caption.edges;
        if (captions.length) {
            caption = captions[0].node.text;
            if (caption.length && caption.match(searchHashtagRegex)) {
                bgSize = (post.dimensions.width > 750) ? 'contain' : 'auto';
                targetPosts.push({
                    caption: caption,
                    bgSize: bgSize,
                    likeCt: post.edge_media_preview_like.count,
                    commentCt: post.edge_media_to_comment.count,
                    url: post.display_url
                });
            }
        }
    }
}


function initQueryCB(xhr) {
    queryCB(xhr);

	nextSlide();
    setInterval(nextSlide, slideTime);
}


function initQueryError(xhr) {
    console.log('initQueryError', xhr);
    return;
    addXMLRequestCallback(function(xhr) {
        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                if (xhr.responseText.substr(0, 7) == '{"data"') {
                    var data = JSON.parse(xhr.responseText).data.data;
                    console.log('grabbed ajax', xhr, getParamByName(xhr.responseURL, 'query_hash'));
                    instaHash = getParamByName(xhr.responseURL, 'query_hash');
                    aget(encodeURI('/graphql/query/?query_hash=' + instaHash + '&variables={"id":"175787939","first":50}'), queryCB, function() {
                        alert("This isn't working!!!");
                    });
                }
            }
        };
    });

    unsafeWindow.scrollTo(0, 1400);
}




function nextSlide() {
    var post = targetPosts[slideI];
    console.log(post, targetPosts, slideI);
    var out = '<li class="singlecard-transition transition-moveright slideid-a" data-transition="transition-moveright"><div class="slide ss-media layout-singleslide layout-singleslide-1 image-slide"><div class="asset pull-left"> <div class="slide-image-blurred-background" style="background-image: url(' + post.url + '); background-size: ' + post.bgSize + ';"></div><div class="slide-image" style="background-image: url(' + post.url + ');background-size: ' + post.bgSize + ';"></div> </div><div class="content-text slides-background-marker pull-left fixed-width"> <div class="author"> <img class="pull-left" src="test-avatar"> <div class="details pull-left"> <div class="name-container"><h2 class="name">sweetbyholly</h2></div><div class="posted-container"><span class="posted">2 years ago</span> on <i class="fab fa-instagram" aria-hidden="true"></i></div></div></div><div class="author-text"></div><div class="other"> <span class="likes"><i class="fas fa-heart" aria-hidden="true"></i> <span class="count">' + post.likeCt + '</span></span><span class="comments-info"><i class="fas fa-comments"></i> <span class="count">' + post.commentCt + '</span></span></div><div class="comments"></div></div></div></li>';


    $newSlide = $(out).appendTo($slides);
    $lastSlide = $slides.children(':not(:last-child)');

    window.setTimeout(function() {
        $lastSlide.addClass('transition');
        $newSlide.addClass('current');

        if ($lastSlide.length) {
            $newSlide.on('transitionend webkitTransitionEnd', function() {
                $lastSlide.remove();
            });
        }
    }, 10);
    ++slideI;
}




function timeAgo(ts) {
    var now = new Date();
    var timeDiff = parseInt(now - ts);
    var days = (timeDiff / (1000 * 60 * 60 * 24));
    if (days > 1) {
        days = parseInt(days);
        var ogDays = days;
        var months = Math.round(days / 30);
        days = days - Math.floor(days / 30) * 30;
        var weeks = Math.round(days / 7);
        days = days - Math.floor(days / 7) * 7;
        return (Math.floor(ogDays / 30) > 0) ? months + " month" + (months > 1 ? "s ago" : " ago") :
            (Math.floor(ogDays / 7) > 0) ? weeks + " week" + (weeks > 1 ? "s ago" : " ago") :
            (days > 0) ? days + " day" + (days > 1 ? "s ago" : " ago") : "";
    } else {
        var hours = (ts / (1000 * 60 * 60));
        hours = Math.round(hours);
        return (hours > 0) ? hours + " hour" + (hours > 1 ? "s ago" : " ago") : "Just Now";
    }
}



function aget(url, cb, errCB = null) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                cb(this);
            } else if (errCB) {
                errCB(this);
            }
        }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
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


function getParamByName(url, name) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}