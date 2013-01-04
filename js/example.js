var fs = {
  bin: {},
  boot: {},
  dev: {},
  etc: {
    default: {},
    'rc.d': {},
    sysconfig: {},
    x11: {}
  },
  home: {
    bob: {},
    jane: {}
  },
  lib: {},
  'lost+found': {},
  misc: {},
  mnt: {
    cdrom: {},
    sysimage: {}
  },
  net: {},
  opt: {},
  proc: {},
  root: {},
  sbin: {},
  usr: {
    x11: {},
    bin: {},
    include: {},
    lib: {},
    local: {},
    man: {},
    sbin: {},
    share: {
      doc: {}
    },
    src: {}
  },
  var: {
    lib: {},
    lock: {},
    run: {},
    log: {
      httpd: {
        access_log: {},
        error_log: {}
      },
      'boot.log': {},
      cron: {},
      messages: {}
    }
  }
};
function buildTree(parent, node) {
  parent.childnodes = _.map(_.pairs(node), function(pair) {
    var child = {
      name: pair[0],
      path: parent.path + "/" + pair[0],
      parent: parent
    };
    buildTree(child, pair[1]);
    return child;
  });
  parent.children = _.keys(node);
  return parent;
}
function findNode(current, parts, callback) {
  if(!parts || parts.length == 0) {
    return callback(current);
  }
  if(parts[0] == ".") {
    // carry on
  } else if(parts[0] == "..") {
    current = current.parent;
  } else {
    current = _.first(_.filter(current.childnodes, function(node) {
      return node.name == parts[0];
    }));
  }
  if(!current) {
    return callback();
  }
  return findNode(current, _.rest(parts), callback);
}
var root = buildTree({
    name: "",
    path: ""
  },
  fs
);
root.path = '/';
var history = Josh.History();
var shell = Josh.Shell({history: history});
var pathhandler = Josh.PathHandler();
pathhandler.current = root;
pathhandler.attach(shell);
pathhandler.getNode = function(path, callback) {
  if(!path) {
    return callback(pathhandler.current);
  }
  var parts = _.filter(path.split('/'), function(x) { return x; });
  var start = ((path || '')[0] == '/') ? root : pathhandler.current;
  console.log('start: '+start.path+', parts: '+JSON.stringify(parts));
  return findNode(start, parts, callback);
};
pathhandler.getChildNodes = function(node, callback) {
  console.log("children for "+node.name);
  callback(node.childnodes);
};

$(document).ready(function() {
  var console = $('#shell-panel');
  shell.onActivate(function() {
    showConsole();
  });
  shell.onDeactivate(function() {
    hideConsole();
  });
  function showConsole() {
    console.slideDown();
    console.focus();
  }

  function hideConsole() {
    console.slideUp();
    console.blur();
  }

  shell.activate();
});
