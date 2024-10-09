import { Logs } from '~/agnostic/misc/logs'
import { HyperJson } from '~/agnostic/html/hyper-json'

console.log(Logs.styles.title('Browser tests.'))

console.log('EYRYYRGERG')

const elt = document.createElement('div')
elt.innerHTML = '<number>7</number>'
const tree = new HyperJson.Tree(elt)
const val = tree.evaluate()
console.log(val)

console.log('done.')
