export function replaceInElement (inputElement: Element, replaceMap: Map<Element, Element>): Element {
  const outputElement = inputElement.cloneNode(true) as Element
  const inputChildren = Array.from(inputElement.childNodes)
  inputChildren.forEach(inputChild => {
    if (!(inputChild instanceof Element)) outputElement.appendChild(inputChild.cloneNode(true))
    const inputChildElement = inputChild as Element
    const replacedChildElement = replaceMap.get(inputChildElement)
    const deepReplacedChildElement = replaceInElement(
      replacedChildElement !== undefined
        ? replacedChildElement
        : inputChildElement,
      replaceMap)
    outputElement.appendChild(deepReplacedChildElement.cloneNode(true))
  })
  return outputElement
}
