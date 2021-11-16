export const STYLE = {
  NPM: 'NPM',
  FMW: 'FMW'
};

export function draw(node, options) {
  const args = buildDrawArgs(node, options);
  return drawStyle(...args);
}

export function drawAsync(node, options) {
  const args = buildDrawArgs(node, options);
  return drawStyleAsync(...args);
}

const styleMap = {
  NPM: {
    rootNode({ chr }, nodes) {
      return `${chr('└')}${chr('─')}${nodes.length ? chr('┬') : chr('─')} `;
    },
    rootNodeNextPrefix(_options) {
      return '  ';
    },
    childNode({ chr }, last, nodes) {
      return `${last ? chr('└') : chr('├')}${chr('─')}${nodes.length ? chr('┬') : chr('─')} `;
    },
    childNodeNextPrefix({ chr }, last) {
      return `${last ? ' ' : chr('│')} `;
    },
    sep({ chr }, nextPrefix, nodes) {
      return `\n${nextPrefix}${nodes.length ? chr('│') : ' '} `;
    }
  },
  FMW: {
    rootNode({ chr }, _nodes) {
      return `${chr('└')}${chr('─')}${chr('─')} `;
    },
    rootNodeNextPrefix(_options) {
      return '    ';
    },
    childNode({ chr }, last, _nodes) {
      return `${last ? chr('└') : chr('├')}${chr('─')}${chr('─')} `;
    },
    childNodeNextPrefix({ chr }, last) {
      return `${last ? ' ' : chr('│')}   `;
    },
    sep(_options, nextPrefix, _nodes) {
      return `\n${nextPrefix}`;
    }
  }
};

function buildDrawArgs(node, options) {
  options = options || {};

  const opts = {
    label: buildGetLabelFn(options),
    nodes: buildGetNodesFn(options),
    chr: buildGetCharFn(options),
    drawRootBranch: options.drawRootBranch === true,
    concurrency: options.concurrency
  };

  const style = styleMap[options.style || STYLE.NPM];
  if (!style) {
    throw new Error(`Not supports style "${style}"`);
  }

  return [style, node, opts, options.prefix || '', true, true];
}

function drawStyle(style, node, options, prefix, last, isRoot) {
  const label = options.label(node) || '';
  const nodes = options.nodes(node) || [];

  let tree = prefix;
  let nextPrefix = prefix;

  if (!isRoot) {
    tree += style.childNode(options, last, nodes);
    nextPrefix += style.childNodeNextPrefix(options, last);

  } else if (options.drawRootBranch) {
    tree += style.rootNode(options, nodes);
    nextPrefix += style.rootNodeNextPrefix(options);
  }

  tree += `${label.split('\n').join(style.sep(options, nextPrefix, nodes))}\n`;

  for (let i = 0, l = nodes.length; i < l; i++) {
    tree += drawStyle(style, nodes[i], options, nextPrefix, i === l - 1, false);
  }

  return tree;
}

async function drawStyleAsync(style, node, options, prefix, last, isRoot) {
  const label = await options.label(node) || '';
  const nodes = await options.nodes(node) || [];

  let tree = prefix;
  let nextPrefix = prefix;

  if (!isRoot) {
    tree += style.childNode(options, last, nodes);
    nextPrefix += style.childNodeNextPrefix(options, last);

  } else if (options.drawRootBranch) {
    tree += style.rootNode(options, nodes);
    nextPrefix += style.rootNodeNextPrefix(options);
  }

  tree += `${label.split('\n').join(style.sep(options, nextPrefix, nodes))}\n`;
  return tree
    + (await map(
      nodes,
      (node, i) => drawStyleAsync(style, node, options, nextPrefix, i === nodes.length - 1, false),
      options.concurrency
    )).join('');
}

function buildGetLabelFn(options) {
  if (typeof options.label === 'function') {
    return node => options.label(node);
  } else if (typeof options.label === 'string') {
    return node => (typeof node === 'string' ? node : node[options.label]);
  } else {
    return node => (typeof node === 'string' ? node : node.label);
  }
}

function buildGetNodesFn(options) {
  if (typeof options.nodes === 'function') {
    return node => options.nodes(node);
  } else if (typeof options.nodes === 'string') {
    return node => node[options.nodes];
  } else {
    return node => node.nodes;
  }
}

const chars = {
  '│': '|',
  '└': '`',
  '├': '+',
  '─': '-',
  '┬': '-'
};

function buildGetCharFn(options) {
  if (options.unicode === false) {
    return s => chars[s];
  } else {
    return s => s;
  }
}

async function map(items, mapper, concurrency) {
  if (!items.length) {
    return [];
  }

  if (!concurrency) {
    concurrency = items.length;
  }
  let n = Math.ceil(items.length / concurrency);
  if (n < 1) {
    n = 1;
  }

  const results = [];
  for (let i = 0; i < n; i++) {
    const subItems = items.slice(concurrency * i, concurrency * (i + 1));
    const r = await Promise.all(subItems.map((it, ii) => mapper(it, (concurrency * i) + ii)));
    results.push(r);
  }
  return Array.prototype.concat.apply([], results);
}
