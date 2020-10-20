import { text } from './text'

const div = document.createElement('div')
document.body.appendChild(div)
function render() {
  div.innerHTML = text
}

render()

if(module.hot) {
  module.hot.accept('./text.js', () => {
    render()
  })
}