import { Logs } from '~/agnostic/misc/logs'
import { HyperJson } from '~/agnostic/html/hyper-json'

console.log(Logs.styles.title('Browser tests.'))

const root = document.createElement('div')
root.innerHTML = `<string>
  <toRecord></toRecord>
  <array _name="prop-1">
    <string>Référencé</string>
  </array>
  <ref _name="prop-2">/prop-1/0</ref>
  <toString></toString>
</string>`

const elt = root.firstElementChild as Element
const tree = new HyperJson.Tree(elt, HyperJson.Transformers.defaultGeneratorsMap)
const val = tree.evaluate()

console.log('=====')
console.log(val)
tree.printPerfCounters()
console.log('done.')
