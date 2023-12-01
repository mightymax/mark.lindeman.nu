let url = 'https://mastodon.nl/api/v1/accounts/122112/statuses'
async function getColors() {
  return fetch(url)
    .then(res => {
      if (!res.ok) throw Error(`Failed to load request "`)
      url = ''
      if (res.headers.has('link')) {
        const nextLink = res.headers.get('link').split(/, ?/)
          .map(link => {
            const pairs = link.split(/; ?/)
            if (pairs[1] === 'rel="next"') return pairs[0].replace(/^<(.+)>$/, '$1')
          }).filter(link => link !== undefined).reduce((_prev, current) => current)
        if (nextLink) {
          url = nextLink
        }
      }
      return res
    })
    .then(res => res.json())
    .then(posts => {
      posts
        .filter(post => post.media_attachments && post.media_attachments[0].description)
        .forEach(post => {
          const match = post.media_attachments[0].description.match(/^([a-z ]+) \((#[a-f0-9]{6})\) and ([a-z ]+) \((#[a-f0-9]{6})\)$/i)
          if (match !== null) {
            const matchRatio = post.content.match(/\(Contrast ratio: ([\d\.]+):([\d\.]+) \| ([A-Z]+)\)/i)
            if (matchRatio) {
              match.shift()
              const ratio = parseFloat(matchRatio[1]) / parseFloat(matchRatio[2])
              let NAME1, HEX1, NAME2, HEX2
              [NAME1, HEX1, NAME2, HEX2] = match
              if (getPerceptualBrightness(HEX1) > getPerceptualBrightness(HEX2)) {
                process.stdout.write([NAME2, HEX2, colorLuminance(HEX2, 0.6), NAME1, HEX1, colorLuminance(HEX1, 0.6), ratio, matchRatio[3]].join(','))
              } else {
                process.stdout.write([NAME1, HEX1, colorLuminance(HEX1, 0.6), NAME2, HEX2, colorLuminance(HEX2, 0.6), ratio, matchRatio[3]].join(','))
              }
              process.stdout.write('\n')
            }
          }
      })
    })
    .catch(e => {
      console.error(e.message)
    })

}

function hexToHSL(hex) {
    // Remove the hash if it exists
    hex = hex.replace(/^#/, '');

    // Parse the hexadecimal color values
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    // Find the minimum and maximum values among R, G, B
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    // Calculate the lightness
    let l = (max + min) / 2;

    // Calculate the saturation
    let s = 0;
    if (max !== min) {
        s = l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
    }

    // Calculate the hue
    let h = 0;
    if (max !== min) {
        if (max === r) {
            h = (g - b) / (max - min) + (g < b ? 6 : 0);
        } else if (max === g) {
            h = (b - r) / (max - min) + 2;
        } else if (max === b) {
            h = (r - g) / (max - min) + 4;
        }
        h /= 6;
    }

    // Convert values to percentage and round to two decimal places
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    const l2 = Math.round(l * 140);
    l = Math.round(l * 100);

    return [h, s, l, l2];
}

process.stdout.write("NAME1,HEX1,HEX1a,NAME2,HEX2,HEX2a,RATIO,CODE\n")
while(url !== '') {
  await getColors()
}


function colorLuminance(hex, lum) {

	// validate hex string
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	if (hex.length < 6) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
	lum = lum || 0;

	// convert to decimal and change luminosity
	var rgb = "#", c, i;
	for (i = 0; i < 3; i++) {
		c = parseInt(hex.substr(i*2,2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substr(c.length);
	}

	return rgb;
}

function getPerceptualBrightness(color) {
  color = color.replace(/^#/, '');
  var r = parseInt(color.substring(0,2),16);
  var g = parseInt(color.substring(2,4),16);
  var b = parseInt(color.substring(4,6),16);
  return r*2 + g*3 + b;
}