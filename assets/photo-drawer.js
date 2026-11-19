(() => {
  const drawer = document.querySelector('.family-drawer');
  if (!drawer) return;
  const prints = [...drawer.querySelectorAll('.drawer-print')];
  const controls = drawer.querySelector('.drawer-controls');
  const status = document.createElement('span');
  status.className = 'drawer-status';
  status.setAttribute('role', 'status');
  controls.append(status);
  let current = 0;
  function display(index, announce) {
    current = (index + prints.length) % prints.length;
    prints.forEach((print, i) => {
      print.hidden = i !== current;
      print.querySelector('button').setAttribute('aria-pressed', 'false');
    });
    if (announce) status.textContent = prints[current].querySelector('figcaption').innerText;
  }
  prints.forEach(print => {
    const zoom = print.querySelector('button');
    zoom.hidden = false;
    zoom.addEventListener('click', () => {
      zoom.setAttribute('aria-pressed', String(zoom.getAttribute('aria-pressed') !== 'true'));
    });
  });
  controls.querySelectorAll('button').forEach(button =>
    button.addEventListener('click', () => display(current + Number(button.dataset.step), true))
  );
  display(0, false);
  controls.hidden = false;
})();
