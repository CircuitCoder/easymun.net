function getOS() {
  const ver = navigator.appVersion;
  if(ver.indexOf('Win') != -1) {
    if(ver.indexOf('x64') != -1) return 'win32-x64';
    else return 'win32-ia32';
  }
  if(ver.indexOf('Mac')!=-1) return 'darwin-x64';
  if(ver.indexOf('Linux')!=-1) return 'linux-x64';

  return 'win32-x64';
}

const OSName = {
  'win32-x64': 'Win 64-bit',
  'win32-ia32': 'Win 32-bit',
  'darwin-x64': 'macOS',
  'linux-x64': 'Linux 64-bit',
};

const Suffix = {
  'win32-x64': '7z',
  'win32-ia32': '7z',
  'darwin-x64': 'tar.gz',
  'linux-x64': 'tar.gz',
};

let latestStr;
let versions = {};

const versionPtr = [];
const versionSet = new Set();

function bootstrap() {
  const bucket = 'https://store.easymun.com/console-lite';

  fetch(bucket).then(resp => resp.text()).then(data => {
    const parser = new DOMParser();

    const dom = parser.parseFromString(data, 'application/xml');

    const elems = dom.documentElement.querySelectorAll("Contents");
    const keys = Array.from(elems).map(e => e.querySelector("Key").innerHTML);

    const reg = /Console-Lite-v(\d+)\.(\d+)\.(\d+)-([a-zA-Z1-9]*)-(ia32|x64)(-nofont)?./;
    let latest = [0,0,0];

    for(const k of keys) {
      const segs = k.match(reg);
      const vers = segs.slice(1, 4);


      const verStr = `v${vers.join('.')}`;
      if(!(verStr in versions)) versions[verStr] = {};
      const variant = `${segs[4]}-${segs[5]}`;
      if(!(variant in versions[verStr]))
        versions[verStr][variant] = {};
      const hasFont = !!segs[6];

      if(hasFont)
        versions[verStr][variant].font = k;
      else
        versions[verStr][variant].nofont = k;

      if(!versionSet.has(verStr)) {
        versionPtr.push(vers);
        versionSet.add(verStr);
      }
    }

    versionPtr.sort((a,b) => {
      for(let i = 0; i<3; ++i)
        if(a[i] != b[i]) {
          return b[i] - a[i];
          break;
        }
      return 0;
    });

    console.log(versionPtr);

    latestStr = `v${versionPtr[0].join('.')}`;

    document.querySelector('.ver-hint').innerHTML = `${latestStr} ${OSName[getOS()]}`;

    const allVers = document.querySelector('.all-vers');

    for(const vers of versionPtr) {
      const k = `v${vers.join('.')}`;
      const title = document.createElement('h3');
      title.innerHTML = k;
      allVers.appendChild(title);

      for(const variant in versions[k]) {
        const slot = document.createElement('div');
        slot.innerHTML = `<strong>${OSName[variant]}</strong> - <a onclick="window.download('${versions[k][variant].font}')">With fonts</a> - <a onclick="window.download('${versions[k][variant].nofont}')">Without fonts</a>`
        allVers.appendChild(slot);
      }
    }
  });

  window.addEventListener('scroll', e => {
    if(window.scrollY === 0) document.querySelector('nav').classList.remove('retracted');
    else document.querySelector('nav').classList.add('retracted');
  });
}

function downloadDefault() {
  download(`Console-Lite-${latestStr}-${getOS()}.${Suffix[getOS()]}`);
}

function toggleAllVers() {
  document.querySelector('.all-vers').classList.toggle('shown');
}

function download(fn) {
  const uri = `https://store.easymun.com/console-lite/${fn}`;
  window.open(uri);
}
