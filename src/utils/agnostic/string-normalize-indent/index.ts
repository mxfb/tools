export default function stringNormalizeIndent (input: string, indentLevel: number = 0) {
  const indent = (' ').repeat(indentLevel)
  const lines = input.split('\n')
  const normalizedLines = lines.map(line => line.replace(/^\s*/igm, indent))
  return normalizedLines.join('\n')
}
