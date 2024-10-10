import { Logs } from '~/agnostic/misc/logs'
import { HyperJson } from '~/agnostic/html/hyper-json'

console.log(Logs.styles.title('Browser tests.'))

const root = document.createElement('div')
root.innerHTML = `<record>
  <record _name="path-A">
    <number _name="prop-1">8</number>
  </record>
  <record _name="path-B">
    <ref _name="prop-zzzzz">/path-A/prop-1</ref>
  </record>
</record>`

const elt = root.firstElementChild as Element
const tree = new HyperJson.Tree(elt)
const val = tree.evaluate()

console.log('=====')
console.log(val)
// tree.printEvaluationsCounters()
console.log('done.')
