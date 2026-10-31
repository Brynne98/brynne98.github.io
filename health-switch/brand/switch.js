// Bar at the top of each draft site to flip between the options.
(function () {
  var opts = ['1', '2', '3'];
  var parts = location.pathname.split('/').filter(Boolean);
  var here = parts[parts.length - 1] === 'index.html' ? parts[parts.length - 2] : parts[parts.length - 1];
  var bar = document.createElement('nav');
  bar.setAttribute('aria-label', 'Site options');
  bar.style.cssText = 'all:initial;display:flex;align-items:center;justify-content:center;gap:6px;padding:8px 12px;background:#000a3d;font:600 14px/1 system-ui,-apple-system,sans-serif;color:#fff;position:relative;z-index:2147483647';
  var label = document.createElement('span');
  label.textContent = 'Draft site:';
  label.style.cssText = 'all:initial;font:inherit;color:#c9d0ff;margin-right:4px';
  bar.appendChild(label);
  opts.forEach(function (o) {
    var a = document.createElement('a');
    a.href = '../' + o + '/';
    a.textContent = o;
    var on = o === here;
    if (on) a.setAttribute('aria-current', 'page');
    a.style.cssText = 'all:initial;cursor:pointer;font:inherit;padding:7px 14px;border-radius:999px;color:' + (on ? '#001489' : '#fff') + ';background:' + (on ? '#fff' : 'rgba(255,255,255,.12)');
    bar.appendChild(a);
  });
  document.body.insertBefore(bar, document.body.firstChild);
})();
