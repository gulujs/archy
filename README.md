# @gulujs/archy

## Installation

```
npm install @gulujs/archy
```

## Usage

```
const archy = require('@gulujs/archy');
const s = archy.draw({
  label : 'beep',
  nodes : [
    'ity',
    {
      label : 'boop',
      nodes : [
        {
          label : 'o_O',
          nodes : [
            {
              label : 'oh',
              nodes : [ 'hello', 'puny' ]
            },
            'human'
          ]
        },
        'party\ntime!'
      ]
    }
  ]
});
console.log(s);
```

## Output

```
beep
├── ity
└─┬ boop
  ├─┬ o_O
  │ ├─┬ oh
  │ │ ├── hello
  │ │ └── puny
  │ └── human
  └── party
      time!
```

## Options

| Key | Value |
| -- | -- |
| style | default is `'NPM'`, support `'NPM'` or `'FMW'` |
| label | default is `'label'`, support function |
| nodes | default is `'nodes'`, support function |
| unicode | default is `true` |
| drawRootBranch | default is `false` |
| prefix | default is `''` |
| concurrency | default is `Infinity`, only for `drawAsync` |

## Inspired by

- [node-archy](https://github.com/substack/node-archy)

## License

- [MIT](LICENSE)
