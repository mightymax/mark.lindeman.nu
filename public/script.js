const icon = (el) => {
  if (el.dataset.icon) {
    fetch(el.dataset.icon)
      .then((r) => r.text())
      .then((svg) => (el.innerHTML = svg))
      .catch((_) => (el.innerText = "⚠️"));
  }
};

const defaultColors = {
  primary_name: 'Cinder', 
  primary: '#120b17', 
  primary_light: '#190f20', 
  secundary_name: 'Fern', 
  secundary: '#5BBA78', 
  secundary_light: "#7fffa8"
}

window.onload = () => {
  if(document.cookie) {
    const match = document.cookie.match(/palette=([a-z ]+) (#[a-f0-9]{6}) (#[a-f0-9]{6}) ([a-z ]+) (#[a-f0-9]{6}) (#[a-f0-9]{6})/i)
    if(match) {
      match.shift()
      const ds = {
        primary_name: match[0], 
        primary: match[1], 
        primary_light: match[2], 
        secundary_name: match[3], 
        secundary: match[4], 
        secundary_light: match[5]
      }
      setColor(ds, false)
    } else {
      setColor(defaultColors, false)
    }
  }
  document.querySelectorAll("ul.icons li").forEach((li) => {
    const a = li.querySelector("a");
    li.title = a.title;
    li.addEventListener("click", () => (window.location = a.href));
  });
  document.querySelectorAll("[data-icon]").forEach((el) => icon(el));
  displayColorPicker()
};
const colorPicker = document.querySelector('.colors')

const allColors = []

const displayColorPicker = () => {
  fetch("colors.csv?1")
    .then((res) => res.text())
    .then((csv) => {
      const lines = csv.split("\n");
      lines.shift()
      addColor(defaultColors)
      for (let line of lines) {
        line = line.split(",");
        addColor({
          primary_name: line[0],
          primary: line[1],
          primary_light: line[2],
          secundary_name: line[3],
          secundary: line[4],
          secundary_light: line[5],
        })
      }
    })
    .then(_ => {
      const toggle = document.getElementById('pallette')
      toggle.classList.toggle('hidden')
      toggle.onclick = (e) => {
        e.preventDefault()
        colorPicker.classList.toggle('hidden')
      }
      const shuffle = document.getElementById('shuffle')
      shuffle.classList.toggle('hidden')
      shuffle.onclick = (e) => {
        e.preventDefault()
        setColor(allColors[Math.floor(Math.random() * allColors.length)], true)
        colorPicker.classList.add('hidden')
      }
      Array.from(document.querySelectorAll('div')).forEach(el => {
        el.onclick = (ev) => {
          if(ev.target.classList) {
            for (const className of Array.from(ev.target.classList)) {
              console.log(className, className.startsWith('about'))
              if (className.startsWith('about') || className === 'color-picker') {
                colorPicker.classList.add('hidden')
                break
              }
            }
          }
        }
      })
    });
}

function addColor(ds) {
  const a = document.createElement("a");
  allColors.push(ds)
  a.onclick = () => {
    setColor(a.dataset)
    colorPicker.classList.toggle('hidden')
    window.scrollTo(0, 0);
  };
  for (const key of Object.keys(ds)) {
    a.dataset[key] = ds[key]
  }
  a.innerHTML = `<span class="primary" style="background-color: ${a.dataset.primary}; color:${a.dataset.secundary};">${a.dataset.primary_name}</span>
                        <span class="secundary" style="background-color: ${a.dataset.secundary}; color:${a.dataset.primary};">${a.dataset.secundary_name}</span>`;
  colorPicker.appendChild(a);

}

function setColor(ds, save) {
  document.documentElement.setAttribute(
    "style",
    `--primary: ${ds.primary}; 
      --primary_light: ${ds.primary_light}; 
      --secundary: ${ds.secundary}; 
      --secundary_light: ${ds.secundary_light};
    `
  );
  if(save??true) {
    const d = new Date();
    d.setTime(d.getTime() + (30*24*60*60*1000));
    document.cookie = `palette=${ds.primary_name} ${ds.primary} ${ds.primary_light} ${ds.secundary_name} ${ds.secundary} ${ds.secundary_light};expires=${d.toUTCString()};path=/`
  }
}