/* EXERCISE MEDIA - ES5
   Two-frame animated demo (public-domain images, needs internet) plus a "Watch video" button
   that opens a YouTube form tutorial search. Exercises without a matching image still get the video link. */

var ExerciseMedia = (function() {

  function frames(id) {
    var slug = (typeof EXERCISE_MEDIA !== 'undefined') ? EXERCISE_MEDIA.map[id] : null;
    return slug ? [EXERCISE_MEDIA.base + slug + '/0.jpg', EXERCISE_MEDIA.base + slug + '/1.jpg'] : null;
  }

  function videoUrl(id) {
    var ex = EXERCISES[id];
    var name = ex ? ex.name.replace(/\([^)]*\)/g, '') : id;
    return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(name.trim() + ' proper form tutorial');
  }

  function openVideo(id) {
    var url = videoUrl(id);
    var browser = Native.plugin('Browser');
    if (browser) browser.open({ url: url });
    else window.open(url, '_blank', 'noopener');
  }

  /* Hide the whole block if the image cannot load (offline) so no broken icons show */
  function block(id) {
    var f = frames(id);
    var img = f ? '<div class="ex-media">' +
      '<img src="' + esc(f[0]) + '" alt="" loading="lazy" onerror="this.parentNode.style.display=\'none\'">' +
      '<img class="ex-media-b" src="' + esc(f[1]) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">' +
    '</div>' : '';
    return img + '<button class="btn btn-secondary btn-sm btn-full" style="margin:8px 0" onclick="ExerciseMedia.openVideo(\'' + esc(id) + '\')">' +
      icon('play', 14) + ' Watch form video</button>';
  }

  function open(id) {
    var ex = EXERCISES[id];
    if (!ex) return;
    close();
    var o = document.createElement('div');
    o.id = 'media-modal';
    o.className = 'modal-overlay open';
    o.onclick = function(e) { if (e.target === o) close(); };
    o.innerHTML = '<div class="modal-sheet"><div class="modal-handle"></div>' +
      '<h3 style="margin-bottom:10px">' + esc(ex.name) + '</h3>' + block(id) +
      '<button class="btn btn-ghost btn-full" onclick="ExerciseMedia.close()">Close</button></div>';
    document.body.appendChild(o);
  }

  function close() {
    var o = document.getElementById('media-modal');
    if (o && o.parentNode) o.parentNode.removeChild(o);
  }

  return { frames: frames, videoUrl: videoUrl, openVideo: openVideo, block: block, open: open, close: close };
})();
