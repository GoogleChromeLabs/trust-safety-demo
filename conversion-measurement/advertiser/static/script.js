const banner = document.getElementById('notSupportedBanner')
const menuWrapper = document.getElementById('menuWrapper')

if (!document.featurePolicy.allowsFeature('attribution-reporting')) {
  menuWrapper.style.display = 'none'
  if (banner.style.display === 'none') {
    banner.style.display = 'block'
  } else {
    banner.style.display = 'none'
  }
} else {
  menuWrapper.style.display = 'block'
}

// Highlight current menu item
let current = 0
for (var i = 0; i < document.links.length; i++) {
  if (document.links[i].href === document.URL) {
    current = i
  }
}
document.links[current].className = 'current'
