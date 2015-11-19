'use strict';

var obj = {
  name: 'assemble',
  tasks: {
    foo: {},
    bar: {},
    baz: {}
  },
  generators: {
    a: {
      tasks: {
        foo: {},
        bar: {},
        baz: {}
      },
      generators: {
        one: {
          tasks: {
            a: {},
            b: {},
            c: {}
          }
        },
        two: {},
        three: {}
      }
    },
    b: {
      tasks: {
        foo: {},
        bar: {},
        baz: {}
      },
      generators: {
        one: {},
        two: {},
        three: {}
      }
    },
    c: {
      tasks: {
        foo: {},
        bar: {},
        baz: {}
      },
      generators: {
        a: {
          tasks: {
            foo: {},
            bar: {},
            baz: {}
          },
          generators: {
            one: {},
            two: {},
            three: {}
          }
        },
        b: {
          tasks: {
            foo: {},
            bar: {},
            baz: {}
          },
          generators: {
            one: {},
            two: {},
            three: {}
          }
        },
        c: {
          tasks: {
            foo: {},
            bar: {},
            baz: {}
          },
          generators: {
            a: {
              tasks: {
                foo: {},
                bar: {},
                baz: {}
              },
              generators: {
                one: {},
                two: {},
                three: {}
              }
            },
            b: {
              tasks: {
                foo: {},
                bar: {},
                baz: {}
              },
              generators: {
                one: {},
                two: {},
                three: {}
              }
            },
            c: {
              tasks: {
                foo: {},
                bar: {},
                baz: {}
              },
              generators: {
                a: {
                  tasks: {
                    foo: {},
                    bar: {},
                    baz: {}
                  },
                  generators: {
                    one: {},
                    two: {},
                    three: {}
                  }
                },
                b: {
                  tasks: {
                    foo: {},
                    bar: {},
                    baz: {}
                  },
                  generators: {
                    one: {},
                    two: {},
                    three: {}
                  }
                },
                c: {
                  tasks: {
                    foo: {},
                    bar: {},
                    baz: {}
                  },
                  generators: {
                    one: {},
                    two: {},
                    three: {}
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

function createTree(name, app, indent) {
  var tree = {};
  var vis = '';

  vis += name;

  if (app.tasks) {
    tree.tasks = Object.keys(app.tasks);
    vis += ': [ ' + tree.tasks.join(', ') + ' ]';
  }

  if (app.generators) {
    tree.generators = {};
    vis += '\n';
    for (var key in app.generators) {
      // tree.generators[key] = createTree(key, app.generators[key]);
      var res = createTree(key, app.generators[key], indent + '  ');
      // vis += '\n L ';

      vis += indent + res + '\n';
    }
  }

  vis = vis.trim();
  if (indent !== '  ' && !/:/.test(vis)) {
    vis = ' L ' + vis;
  } else if (app.generators) {
    vis += '\n';
  }

  return vis;
  // return tree;
}

var tree = createTree('root', obj, '  ');
console.log(tree);
// console.log(JSON.stringify(tree, null, 2))
