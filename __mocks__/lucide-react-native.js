const React = require('react')
const { View } = require('react-native')

module.exports = new Proxy({}, {
  get: (_, name) => {
    if (name === '__esModule') return true
    if (name === 'default') return {}
    const MockIcon = (props) => React.createElement(View, { ...props, testID: props.testID || String(name) })
    MockIcon.displayName = String(name)
    return MockIcon
  }
})
