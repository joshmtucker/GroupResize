require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"GroupResize":[function(require,module,exports){
var GroupResize, defaults, resizingTypes,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

defaults = {
  resizeChildren: false,
  resizing: "none"
};

resizingTypes = ["none", "stretchWidth", "stretchHeight", "stretch", "pinX", "pinY", "pin", "resizeWidth", "resizeHeight", "resize", "floatX", "floatY", "float"];

GroupResize = (function(superClass) {
  extend(GroupResize, superClass);

  function GroupResize(options) {
    var key, value;
    if (options == null) {
      options = {};
    }
    for (key in defaults) {
      value = defaults[key];
      if (options[key] == null) {
        options[key] = value;
      }
    }
    GroupResize.__super__.constructor.call(this, options);
  }

  GroupResize.prototype._onResize = function() {
    var child, i, len, ref, results;
    if (this.children.length === 0) {
      return;
    }
    ref = this.children;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      child = ref[i];
      if (child.resizing !== "none") {
        results.push(this._resizeChild(child));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  GroupResize.prototype._setResizeProps = function() {
    if (this.parent === null) {
      return;
    }
    this._resizeProps = {};
    this._resizeProps.float = {
      midX: this.midX / this.parent.width,
      midY: this.midY / this.parent.height
    };
    this._resizeProps.resize = {
      width: this.width / this.parent.width,
      height: this.height / this.parent.height,
      midX: this._resizeProps.float.midX,
      midY: this._resizeProps.float.midY
    };
    this._resizeProps.stretch = {
      width: this._resizeProps.resize.width,
      height: this._resizeProps.resize.height
    };
    return this._resizeProps.pin = {
      maxX: this.parent.width - this.maxX,
      maxY: this.parent.height - this.maxY
    };
  };

  GroupResize.prototype._resizeChild = function(child) {
    var key, props, ref, results, value;
    props = {};
    props.floatX = {
      midX: child.parent.width * child._resizeProps.float.midX
    };
    props.floatY = {
      midY: child.parent.height * child._resizeProps.float.midY
    };
    props.float = {
      midX: child.parent.width * child._resizeProps.float.midX,
      midY: child.parent.height * child._resizeProps.float.midY
    };
    props.resizeWidth = {
      width: child.parent.width * child._resizeProps.resize.width,
      midX: props.float.midX
    };
    props.resizeHeight = {
      height: child.parent.height * child._resizeProps.resize.height,
      midY: props.float.midY
    };
    props.resize = {
      width: child.parent.width * child._resizeProps.resize.width,
      height: child.parent.height * child._resizeProps.resize.height,
      midX: props.float.midX,
      midY: props.float.midY
    };
    props.stretchWidth = {
      width: props.resize.width
    };
    props.stretchHeight = {
      height: props.resize.height
    };
    props.stretch = {
      width: props.resize.width,
      height: props.resize.height
    };
    props.pinX = {
      maxX: child.parent.width - child._resizeProps.pin.maxX
    };
    props.pinY = {
      maxY: child.parent.height - child._resizeProps.pin.maxY
    };
    props.pin = {
      maxX: child.parent.width - child._resizeProps.pin.maxX,
      maxY: child.parent.height - child._resizeProps.pin.maxY
    };
    ref = props[child.resizing];
    results = [];
    for (key in ref) {
      value = ref[key];
      results.push(child[key] = value);
    }
    return results;
  };

  GroupResize.define("resizeChildren", {
    get: function() {
      return this._resizeChildren;
    },
    set: function(value) {
      if (_.isBoolean(value) === false) {
        throw Error("'resizeChildren' must be true or false");
      }
      if (value) {
        this.on("change:size", this._onResize);
      } else {
        this.off("change:size", this._onResize);
      }
      return this._resizeChildren = value;
    }
  });

  GroupResize.define("resizing", {
    get: function() {
      return this._resizing;
    },
    set: function(value) {
      if (_.indexOf(resizingTypes, value) === -1) {
        throw Error("'" + value + "' isn't a supported resizing type");
      }
      if (value !== "none") {
        this.on("change:frame", this._setResizeProps);
        this.on("change:parent", this._setResizeProps);
      } else {
        this.off("change:frame", this._setResizeProps);
        this.off("change:parent", this._setResizeProps);
      }
      this._setResizeProps();
      return this._resizing = value;
    }
  });

  GroupResize.define("_resizeProps", {
    get: function() {
      return this._rProps;
    },
    set: function(value) {
      return this._rProps = value;
    }
  });

  GroupResize.mixin = function(Class) {
    var capitalizeFirstLetter, cleanClassName, key, value;
    cleanClassName = /layer/i.test(Class.name) ? "Layer" : Class.name;
    capitalizeFirstLetter = function(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    };
    for (key in defaults) {
      value = defaults[key];
      Framer.Defaults[cleanClassName][key] = value;
      Class.define(key, {
        configurable: true,
        get: this.prototype["get" + (capitalizeFirstLetter(key))],
        set: this.prototype["set" + (capitalizeFirstLetter(key))]
      });
    }
    Class.prototype._onResize = this.prototype._onResize;
    Class.prototype._setResizeProps = this.prototype._setResizeProps;
    return Class.prototype._resizeChild = this.prototype._resizeChild;
  };

  return GroupResize;

})(Layer);

GroupResize.mixin(Layer);

if (typeof module !== "undefined" && module !== null) {
  module.exports = GroupResize;
}


},{}],"GroupResize":[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
var GroupResize, defaults, resizingTypes,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

defaults = {
  resizeChildren: false,
  resizing: "none"
};

resizingTypes = ["none", "stretchWidth", "stretchHeight", "stretch", "pinX", "pinY", "pin", "resizeWidth", "resizeHeight", "resize", "floatX", "floatY", "float"];

GroupResize = (function(superClass) {
  extend(GroupResize, superClass);

  function GroupResize(options) {
    var key, value;
    if (options == null) {
      options = {};
    }
    for (key in defaults) {
      value = defaults[key];
      if (options[key] == null) {
        options[key] = value;
      }
    }
    GroupResize.__super__.constructor.call(this, options);
  }

  GroupResize.prototype._onResize = function() {
    var child, i, len, ref, results;
    if (this.children.length === 0) {
      return;
    }
    ref = this.children;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      child = ref[i];
      if (child.resizing !== "none") {
        results.push(this._resizeChild(child));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  GroupResize.prototype._setResizeProps = function() {
    if (this.parent === null) {
      return;
    }
    this._resizeProps = {};
    this._resizeProps.float = {
      midX: this.midX / this.parent.width,
      midY: this.midY / this.parent.height
    };
    this._resizeProps.resize = {
      width: this.width / this.parent.width,
      height: this.height / this.parent.height,
      midX: this._resizeProps.float.midX,
      midY: this._resizeProps.float.midY
    };
    this._resizeProps.stretch = {
      width: this._resizeProps.resize.width,
      height: this._resizeProps.resize.height
    };
    return this._resizeProps.pin = {
      maxX: this.parent.width - this.maxX,
      maxY: this.parent.height - this.maxY
    };
  };

  GroupResize.prototype._resizeChild = function(child) {
    var key, props, ref, results, value;
    props = {};
    props.floatX = {
      midX: child.parent.width * child._resizeProps.float.midX
    };
    props.floatY = {
      midY: child.parent.height * child._resizeProps.float.midY
    };
    props.float = {
      midX: child.parent.width * child._resizeProps.float.midX,
      midY: child.parent.height * child._resizeProps.float.midY
    };
    props.resizeWidth = {
      width: child.parent.width * child._resizeProps.resize.width,
      midX: props.float.midX
    };
    props.resizeHeight = {
      height: child.parent.height * child._resizeProps.resize.height,
      midY: props.float.midY
    };
    props.resize = {
      width: child.parent.width * child._resizeProps.resize.width,
      height: child.parent.height * child._resizeProps.resize.height,
      midX: props.float.midX,
      midY: props.float.midY
    };
    props.stretchWidth = {
      width: props.resize.width
    };
    props.stretchHeight = {
      height: props.resize.height
    };
    props.stretch = {
      width: props.resize.width,
      height: props.resize.height
    };
    props.pinX = {
      maxX: child.parent.width - child._resizeProps.pin.maxX
    };
    props.pinY = {
      maxY: child.parent.height - child._resizeProps.pin.maxY
    };
    props.pin = {
      maxX: child.parent.width - child._resizeProps.pin.maxX,
      maxY: child.parent.height - child._resizeProps.pin.maxY
    };
    ref = props[child.resizing];
    results = [];
    for (key in ref) {
      value = ref[key];
      results.push(child[key] = value);
    }
    return results;
  };

  GroupResize.define("resizeChildren", {
    get: function() {
      return this._resizeChildren;
    },
    set: function(value) {
      if (_.isBoolean(value) === false) {
        throw Error("'resizeChildren' must be true or false");
      }
      if (value) {
        this.on("change:size", this._onResize);
      } else {
        this.off("change:size", this._onResize);
      }
      return this._resizeChildren = value;
    }
  });

  GroupResize.define("resizing", {
    get: function() {
      return this._resizing;
    },
    set: function(value) {
      if (_.indexOf(resizingTypes, value) === -1) {
        throw Error("'" + value + "' isn't a supported resizing type");
      }
      if (value !== "none") {
        this.on("change:frame", this._setResizeProps);
        this.on("change:parent", this._setResizeProps);
      } else {
        this.off("change:frame", this._setResizeProps);
        this.off("change:parent", this._setResizeProps);
      }
      this._setResizeProps();
      return this._resizing = value;
    }
  });

  GroupResize.define("_resizeProps", {
    get: function() {
      return this._rProps;
    },
    set: function(value) {
      return this._rProps = value;
    }
  });

  GroupResize.mixin = function(Class) {
    var capitalizeFirstLetter, cleanClassName, key, value;
    cleanClassName = /layer/i.test(Class.name) ? "Layer" : Class.name;
    capitalizeFirstLetter = function(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    };
    for (key in defaults) {
      value = defaults[key];
      Framer.Defaults[cleanClassName][key] = value;
      Class.define(key, {
        configurable: true,
        get: this.prototype["get" + (capitalizeFirstLetter(key))],
        set: this.prototype["set" + (capitalizeFirstLetter(key))]
      });
    }
    Class.prototype._onResize = this.prototype._onResize;
    Class.prototype._setResizeProps = this.prototype._setResizeProps;
    return Class.prototype._resizeChild = this.prototype._resizeChild;
  };

  return GroupResize;

})(Layer);

GroupResize.mixin(Layer);

if (typeof module !== "undefined" && module !== null) {
  module.exports = GroupResize;
}

},{}]},{},[])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvam9zaG10dWNrZXIvRGVza3RvcC9Hcm91cFJlc2l6aW5ndjQuZnJhbWVyL21vZHVsZXMvR3JvdXBSZXNpemUuY29mZmVlIiwiLi4vLi4vLi4vLi4vLi4vVXNlcnMvam9zaG10dWNrZXIvRGVza3RvcC9Hcm91cFJlc2l6aW5ndjQuZnJhbWVyL21vZHVsZXMvR3JvdXBSZXNpemUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxJQUFBLG9DQUFBO0VBQUE7OztBQUFBLFFBQUEsR0FDQztFQUFBLGNBQUEsRUFBZ0IsS0FBaEI7RUFDQSxRQUFBLEVBQVUsTUFEVjs7O0FBR0QsYUFBQSxHQUFnQixDQUFDLE1BQUQsRUFBUyxjQUFULEVBQXlCLGVBQXpCLEVBQTBDLFNBQTFDLEVBQXFELE1BQXJELEVBQTZELE1BQTdELEVBQXFFLEtBQXJFLEVBQTRFLGFBQTVFLEVBQTJGLGNBQTNGLEVBQTJHLFFBQTNHLEVBQXFILFFBQXJILEVBQStILFFBQS9ILEVBQXlJLE9BQXpJOztBQUVWOzs7RUFDUSxxQkFBQyxPQUFEO0FBQ1osUUFBQTs7TUFEYSxVQUFROztBQUNyQixTQUFBLGVBQUE7OztRQUNDLE9BQVEsQ0FBQSxHQUFBLElBQVE7O0FBRGpCO0lBRUEsNkNBQU0sT0FBTjtFQUhZOzt3QkFNYixTQUFBLEdBQVcsU0FBQTtBQUVWLFFBQUE7SUFBQSxJQUFVLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixLQUFvQixDQUE5QjtBQUFBLGFBQUE7O0FBR0E7QUFBQTtTQUFBLHFDQUFBOztNQUNDLElBQUcsS0FBSyxDQUFDLFFBQU4sS0FBb0IsTUFBdkI7cUJBQ0MsSUFBQyxDQUFBLFlBQUQsQ0FBYyxLQUFkLEdBREQ7T0FBQSxNQUFBOzZCQUFBOztBQUREOztFQUxVOzt3QkFVWCxlQUFBLEdBQWlCLFNBQUE7SUFFaEIsSUFBVSxJQUFDLENBQUEsTUFBRCxLQUFXLElBQXJCO0FBQUEsYUFBQTs7SUFFQSxJQUFDLENBQUEsWUFBRCxHQUFnQjtJQUdoQixJQUFDLENBQUEsWUFBWSxDQUFDLEtBQWQsR0FDQztNQUFBLElBQUEsRUFBTSxJQUFDLENBQUEsSUFBRCxHQUFNLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBcEI7TUFDQSxJQUFBLEVBQU0sSUFBQyxDQUFBLElBQUQsR0FBTSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BRHBCOztJQUlELElBQUMsQ0FBQSxZQUFZLENBQUMsTUFBZCxHQUNDO01BQUEsS0FBQSxFQUFPLElBQUMsQ0FBQSxLQUFELEdBQU8sSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUF0QjtNQUNBLE1BQUEsRUFBUSxJQUFDLENBQUEsTUFBRCxHQUFRLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFEeEI7TUFFQSxJQUFBLEVBQU0sSUFBQyxDQUFBLFlBQVksQ0FBQyxLQUFLLENBQUMsSUFGMUI7TUFHQSxJQUFBLEVBQU0sSUFBQyxDQUFBLFlBQVksQ0FBQyxLQUFLLENBQUMsSUFIMUI7O0lBTUQsSUFBQyxDQUFBLFlBQVksQ0FBQyxPQUFkLEdBQ0M7TUFBQSxLQUFBLEVBQU8sSUFBQyxDQUFBLFlBQVksQ0FBQyxNQUFNLENBQUMsS0FBNUI7TUFDQSxNQUFBLEVBQVEsSUFBQyxDQUFBLFlBQVksQ0FBQyxNQUFNLENBQUMsTUFEN0I7O1dBSUQsSUFBQyxDQUFBLFlBQVksQ0FBQyxHQUFkLEdBQ0M7TUFBQSxJQUFBLEVBQU0sSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFSLEdBQWdCLElBQUMsQ0FBQSxJQUF2QjtNQUNBLElBQUEsRUFBTSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsR0FBaUIsSUFBQyxDQUFBLElBRHhCOztFQXpCZTs7d0JBNEJqQixZQUFBLEdBQWMsU0FBQyxLQUFEO0FBQ2IsUUFBQTtJQUFBLEtBQUEsR0FBUTtJQUlSLEtBQUssQ0FBQyxNQUFOLEdBQ0M7TUFBQSxJQUFBLEVBQU0sS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFiLEdBQXFCLEtBQUssQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLElBQXBEOztJQUdELEtBQUssQ0FBQyxNQUFOLEdBQ0M7TUFBQSxJQUFBLEVBQU0sS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFiLEdBQXNCLEtBQUssQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLElBQXJEOztJQUdELEtBQUssQ0FBQyxLQUFOLEdBQ0M7TUFBQSxJQUFBLEVBQU0sS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFiLEdBQXFCLEtBQUssQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLElBQXBEO01BQ0EsSUFBQSxFQUFNLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBYixHQUFzQixLQUFLLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxJQURyRDs7SUFLRCxLQUFLLENBQUMsV0FBTixHQUNDO01BQUEsS0FBQSxFQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBYixHQUFxQixLQUFLLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxLQUF0RDtNQUNBLElBQUEsRUFBTSxLQUFLLENBQUMsS0FBSyxDQUFDLElBRGxCOztJQUlELEtBQUssQ0FBQyxZQUFOLEdBQ0M7TUFBQSxNQUFBLEVBQVEsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFiLEdBQXNCLEtBQUssQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLE1BQXhEO01BQ0EsSUFBQSxFQUFNLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFEbEI7O0lBSUQsS0FBSyxDQUFDLE1BQU4sR0FDQztNQUFBLEtBQUEsRUFBTyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQWIsR0FBcUIsS0FBSyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsS0FBdEQ7TUFDQSxNQUFBLEVBQVEsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFiLEdBQXNCLEtBQUssQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLE1BRHhEO01BRUEsSUFBQSxFQUFNLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFGbEI7TUFHQSxJQUFBLEVBQU0sS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUhsQjs7SUFPRCxLQUFLLENBQUMsWUFBTixHQUNDO01BQUEsS0FBQSxFQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBcEI7O0lBR0QsS0FBSyxDQUFDLGFBQU4sR0FDQztNQUFBLE1BQUEsRUFBUSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQXJCOztJQUdELEtBQUssQ0FBQyxPQUFOLEdBQ0M7TUFBQSxLQUFBLEVBQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFwQjtNQUNBLE1BQUEsRUFBUSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BRHJCOztJQUtELEtBQUssQ0FBQyxJQUFOLEdBQ0M7TUFBQSxJQUFBLEVBQU0sS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFiLEdBQXFCLEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQWxEOztJQUdELEtBQUssQ0FBQyxJQUFOLEdBQ0M7TUFBQSxJQUFBLEVBQU0sS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFiLEdBQXNCLEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQW5EOztJQUdELEtBQUssQ0FBQyxHQUFOLEdBQ0M7TUFBQSxJQUFBLEVBQU0sS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFiLEdBQXFCLEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQWxEO01BQ0EsSUFBQSxFQUFNLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBYixHQUFzQixLQUFLLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQURuRDs7QUFJRDtBQUFBO1NBQUEsVUFBQTs7bUJBQ0MsS0FBTSxDQUFBLEdBQUEsQ0FBTixHQUFhO0FBRGQ7O0VBaEVhOztFQW9FZCxXQUFDLENBQUEsTUFBRCxDQUFRLGdCQUFSLEVBQ0M7SUFBQSxHQUFBLEVBQUssU0FBQTthQUFHLElBQUMsQ0FBQTtJQUFKLENBQUw7SUFDQSxHQUFBLEVBQUssU0FBQyxLQUFEO01BRUosSUFBRyxDQUFDLENBQUMsU0FBRixDQUFZLEtBQVosQ0FBQSxLQUFzQixLQUF6QjtBQUNDLGNBQU0sS0FBQSxDQUFNLHdDQUFOLEVBRFA7O01BSUEsSUFBRyxLQUFIO1FBQ0MsSUFBQyxDQUFBLEVBQUQsQ0FBSSxhQUFKLEVBQW1CLElBQUMsQ0FBQSxTQUFwQixFQUREO09BQUEsTUFBQTtRQUdDLElBQUMsQ0FBQSxHQUFELENBQUssYUFBTCxFQUFvQixJQUFDLENBQUEsU0FBckIsRUFIRDs7YUFLQSxJQUFDLENBQUEsZUFBRCxHQUFtQjtJQVhmLENBREw7R0FERDs7RUFnQkEsV0FBQyxDQUFBLE1BQUQsQ0FBUSxVQUFSLEVBQ0M7SUFBQSxHQUFBLEVBQUssU0FBQTthQUFHLElBQUMsQ0FBQTtJQUFKLENBQUw7SUFDQSxHQUFBLEVBQUssU0FBQyxLQUFEO01BRUosSUFBRyxDQUFDLENBQUMsT0FBRixDQUFVLGFBQVYsRUFBeUIsS0FBekIsQ0FBQSxLQUFtQyxDQUFDLENBQXZDO0FBQ0MsY0FBTSxLQUFBLENBQU0sR0FBQSxHQUFJLEtBQUosR0FBVSxtQ0FBaEIsRUFEUDs7TUFJQSxJQUFHLEtBQUEsS0FBVyxNQUFkO1FBQ0MsSUFBQyxDQUFBLEVBQUQsQ0FBSSxjQUFKLEVBQW9CLElBQUMsQ0FBQSxlQUFyQjtRQUNBLElBQUMsQ0FBQSxFQUFELENBQUksZUFBSixFQUFxQixJQUFDLENBQUEsZUFBdEIsRUFGRDtPQUFBLE1BQUE7UUFJQyxJQUFDLENBQUEsR0FBRCxDQUFLLGNBQUwsRUFBcUIsSUFBQyxDQUFBLGVBQXRCO1FBQ0EsSUFBQyxDQUFBLEdBQUQsQ0FBSyxlQUFMLEVBQXNCLElBQUMsQ0FBQSxlQUF2QixFQUxEOztNQVFBLElBQUMsQ0FBQSxlQUFELENBQUE7YUFFQSxJQUFDLENBQUEsU0FBRCxHQUFhO0lBaEJULENBREw7R0FERDs7RUFvQkEsV0FBQyxDQUFBLE1BQUQsQ0FBUSxjQUFSLEVBQ0M7SUFBQSxHQUFBLEVBQUssU0FBQTthQUFHLElBQUMsQ0FBQTtJQUFKLENBQUw7SUFDQSxHQUFBLEVBQUssU0FBQyxLQUFEO2FBQVcsSUFBQyxDQUFBLE9BQUQsR0FBVztJQUF0QixDQURMO0dBREQ7O0VBS0EsV0FBQyxDQUFBLEtBQUQsR0FBUSxTQUFDLEtBQUQ7QUFFUCxRQUFBO0lBQUEsY0FBQSxHQUFvQixRQUFRLENBQUMsSUFBVCxDQUFjLEtBQUssQ0FBQyxJQUFwQixDQUFILEdBQWlDLE9BQWpDLEdBQThDLEtBQUssQ0FBQztJQUVyRSxxQkFBQSxHQUF3QixTQUFDLE1BQUQ7QUFDdkIsYUFBTyxNQUFNLENBQUMsTUFBUCxDQUFjLENBQWQsQ0FBZ0IsQ0FBQyxXQUFqQixDQUFBLENBQUEsR0FBaUMsTUFBTSxDQUFDLEtBQVAsQ0FBYSxDQUFiO0lBRGpCO0FBR3hCLFNBQUEsZUFBQTs7TUFDQyxNQUFNLENBQUMsUUFBUyxDQUFBLGNBQUEsQ0FBZ0IsQ0FBQSxHQUFBLENBQWhDLEdBQXVDO01BRXZDLEtBQUssQ0FBQyxNQUFOLENBQWEsR0FBYixFQUNDO1FBQUEsWUFBQSxFQUFjLElBQWQ7UUFDQSxHQUFBLEVBQUssSUFBQyxDQUFBLFNBQUcsQ0FBQSxLQUFBLEdBQUssQ0FBQyxxQkFBQSxDQUFzQixHQUF0QixDQUFELENBQUwsQ0FEVDtRQUVBLEdBQUEsRUFBSyxJQUFDLENBQUEsU0FBRyxDQUFBLEtBQUEsR0FBSyxDQUFDLHFCQUFBLENBQXNCLEdBQXRCLENBQUQsQ0FBTCxDQUZUO09BREQ7QUFIRDtJQVFBLEtBQUssQ0FBQSxTQUFFLENBQUEsU0FBUCxHQUFtQixJQUFDLENBQUEsU0FBRSxDQUFBO0lBQ3RCLEtBQUssQ0FBQSxTQUFFLENBQUEsZUFBUCxHQUF5QixJQUFDLENBQUEsU0FBRSxDQUFBO1dBQzVCLEtBQUssQ0FBQSxTQUFFLENBQUEsWUFBUCxHQUFzQixJQUFDLENBQUEsU0FBRSxDQUFBO0VBakJsQjs7OztHQTFKaUI7O0FBNksxQixXQUFXLENBQUMsS0FBWixDQUFrQixLQUFsQjs7O0VBRUEsTUFBTSxDQUFFLE9BQVIsR0FBa0I7Ozs7O0FDckxsQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZGVmYXVsdHMgPSBcblx0cmVzaXplQ2hpbGRyZW46IGZhbHNlXG5cdHJlc2l6aW5nOiBcIm5vbmVcIlxuXHRcbnJlc2l6aW5nVHlwZXMgPSBbXCJub25lXCIsIFwic3RyZXRjaFdpZHRoXCIsIFwic3RyZXRjaEhlaWdodFwiLCBcInN0cmV0Y2hcIiwgXCJwaW5YXCIsIFwicGluWVwiLCBcInBpblwiLCBcInJlc2l6ZVdpZHRoXCIsIFwicmVzaXplSGVpZ2h0XCIsIFwicmVzaXplXCIsIFwiZmxvYXRYXCIsIFwiZmxvYXRZXCIsIFwiZmxvYXRcIl1cblxuY2xhc3MgR3JvdXBSZXNpemUgZXh0ZW5kcyBMYXllclxuXHRjb25zdHJ1Y3RvcjogKG9wdGlvbnM9e30pIC0+XG5cdFx0Zm9yIGtleSwgdmFsdWUgb2YgZGVmYXVsdHNcblx0XHRcdG9wdGlvbnNba2V5XSA/PSB2YWx1ZSBcblx0XHRzdXBlciBvcHRpb25zXG5cdFxuXHQjIEZVTkNUSU9OUyDigJMgUGFyZW50XHRcblx0X29uUmVzaXplOiAtPlxuXHRcdCMgUmV0dXJuIGlmIG5vIGNoaWxkcmVuXG5cdFx0cmV0dXJuIGlmIEBjaGlsZHJlbi5sZW5ndGggaXMgMFxuXHRcdFxuXHRcdCMgUmVzaXplIGNoaWxkcmVuXG5cdFx0Zm9yIGNoaWxkIGluIEBjaGlsZHJlblxuXHRcdFx0aWYgY2hpbGQucmVzaXppbmcgaXNudCBcIm5vbmVcIlxuXHRcdFx0XHRAX3Jlc2l6ZUNoaWxkKGNoaWxkKVxuXHRcdFx0XHRcblx0IyBGVU5DVElPTlMg4oCTIENoaWxkXG5cdF9zZXRSZXNpemVQcm9wczogLT5cblx0XHQjIFJldHVybiBpZiBubyBwYXJlbnRcblx0XHRyZXR1cm4gaWYgQHBhcmVudCBpcyBudWxsXG5cdFx0XG5cdFx0QF9yZXNpemVQcm9wcyA9IHt9XG5cdFx0XG5cdFx0IyBGbG9hdFxuXHRcdEBfcmVzaXplUHJvcHMuZmxvYXQgPSBcblx0XHRcdG1pZFg6IEBtaWRYL0BwYXJlbnQud2lkdGhcblx0XHRcdG1pZFk6IEBtaWRZL0BwYXJlbnQuaGVpZ2h0XG5cdFx0XG5cdFx0IyBSZXNpemVcblx0XHRAX3Jlc2l6ZVByb3BzLnJlc2l6ZSA9IFxuXHRcdFx0d2lkdGg6IEB3aWR0aC9AcGFyZW50LndpZHRoXG5cdFx0XHRoZWlnaHQ6IEBoZWlnaHQvQHBhcmVudC5oZWlnaHRcblx0XHRcdG1pZFg6IEBfcmVzaXplUHJvcHMuZmxvYXQubWlkWFxuXHRcdFx0bWlkWTogQF9yZXNpemVQcm9wcy5mbG9hdC5taWRZXG5cdFx0XG5cdFx0IyBTdHJldGNoXHRcblx0XHRAX3Jlc2l6ZVByb3BzLnN0cmV0Y2ggPSBcblx0XHRcdHdpZHRoOiBAX3Jlc2l6ZVByb3BzLnJlc2l6ZS53aWR0aFxuXHRcdFx0aGVpZ2h0OiBAX3Jlc2l6ZVByb3BzLnJlc2l6ZS5oZWlnaHRcblx0XHRcblx0XHQjIFBpblxuXHRcdEBfcmVzaXplUHJvcHMucGluID0gXG5cdFx0XHRtYXhYOiBAcGFyZW50LndpZHRoIC0gQG1heFhcblx0XHRcdG1heFk6IEBwYXJlbnQuaGVpZ2h0IC0gQG1heFlcblx0XHRcdFx0XHRcblx0X3Jlc2l6ZUNoaWxkOiAoY2hpbGQpIC0+XG5cdFx0cHJvcHMgPSB7fVxuXHRcdFxuXHRcdCMgRkxPQVRcblx0XHQjIGZsb2F0WCBcblx0XHRwcm9wcy5mbG9hdFggPSBcblx0XHRcdG1pZFg6IGNoaWxkLnBhcmVudC53aWR0aCAqIGNoaWxkLl9yZXNpemVQcm9wcy5mbG9hdC5taWRYXG5cdFx0XG5cdFx0I2Zsb2F0WVx0XG5cdFx0cHJvcHMuZmxvYXRZID0gXG5cdFx0XHRtaWRZOiBjaGlsZC5wYXJlbnQuaGVpZ2h0ICogY2hpbGQuX3Jlc2l6ZVByb3BzLmZsb2F0Lm1pZFlcblx0XHRcblx0XHQjIGZsb2F0XG5cdFx0cHJvcHMuZmxvYXQgPSBcblx0XHRcdG1pZFg6IGNoaWxkLnBhcmVudC53aWR0aCAqIGNoaWxkLl9yZXNpemVQcm9wcy5mbG9hdC5taWRYXG5cdFx0XHRtaWRZOiBjaGlsZC5wYXJlbnQuaGVpZ2h0ICogY2hpbGQuX3Jlc2l6ZVByb3BzLmZsb2F0Lm1pZFlcblx0XHRcblx0XHQjIFJFU0laRVxuXHRcdCMgcmVzaXplV2lkdGhcblx0XHRwcm9wcy5yZXNpemVXaWR0aCA9IFxuXHRcdFx0d2lkdGg6IGNoaWxkLnBhcmVudC53aWR0aCAqIGNoaWxkLl9yZXNpemVQcm9wcy5yZXNpemUud2lkdGhcblx0XHRcdG1pZFg6IHByb3BzLmZsb2F0Lm1pZFhcblx0XHRcblx0XHQjIHJlc2l6ZUhlaWdodFx0XG5cdFx0cHJvcHMucmVzaXplSGVpZ2h0ID0gXG5cdFx0XHRoZWlnaHQ6IGNoaWxkLnBhcmVudC5oZWlnaHQgKiBjaGlsZC5fcmVzaXplUHJvcHMucmVzaXplLmhlaWdodFxuXHRcdFx0bWlkWTogcHJvcHMuZmxvYXQubWlkWVxuXHRcdFxuXHRcdCMgcmVzaXplXG5cdFx0cHJvcHMucmVzaXplID0gXG5cdFx0XHR3aWR0aDogY2hpbGQucGFyZW50LndpZHRoICogY2hpbGQuX3Jlc2l6ZVByb3BzLnJlc2l6ZS53aWR0aFxuXHRcdFx0aGVpZ2h0OiBjaGlsZC5wYXJlbnQuaGVpZ2h0ICogY2hpbGQuX3Jlc2l6ZVByb3BzLnJlc2l6ZS5oZWlnaHRcblx0XHRcdG1pZFg6IHByb3BzLmZsb2F0Lm1pZFhcblx0XHRcdG1pZFk6IHByb3BzLmZsb2F0Lm1pZFlcblx0XHRcblx0XHQjIFNUUkVUQ0ggXG5cdFx0IyBzdHJldGNoV2lkdGhcblx0XHRwcm9wcy5zdHJldGNoV2lkdGggPSBcblx0XHRcdHdpZHRoOiBwcm9wcy5yZXNpemUud2lkdGhcblx0XHRcblx0XHQjIHN0cmV0Y2hIZWlnaHRcdFxuXHRcdHByb3BzLnN0cmV0Y2hIZWlnaHQgPSBcblx0XHRcdGhlaWdodDogcHJvcHMucmVzaXplLmhlaWdodFxuXHRcdFxuXHRcdCMgc3RyZXRjaFx0XHRcblx0XHRwcm9wcy5zdHJldGNoID0gXG5cdFx0XHR3aWR0aDogcHJvcHMucmVzaXplLndpZHRoXG5cdFx0XHRoZWlnaHQ6IHByb3BzLnJlc2l6ZS5oZWlnaHRcblx0XHRcdFxuXHRcdCMgUElOIFxuXHRcdCMgcGluWFxuXHRcdHByb3BzLnBpblggPSBcblx0XHRcdG1heFg6IGNoaWxkLnBhcmVudC53aWR0aCAtIGNoaWxkLl9yZXNpemVQcm9wcy5waW4ubWF4WFxuXHRcdFxuXHRcdCMgcGluWVx0XG5cdFx0cHJvcHMucGluWSA9IFxuXHRcdFx0bWF4WTogY2hpbGQucGFyZW50LmhlaWdodCAtIGNoaWxkLl9yZXNpemVQcm9wcy5waW4ubWF4WVxuXHRcdFxuXHRcdCMgcGluXG5cdFx0cHJvcHMucGluID0gXG5cdFx0XHRtYXhYOiBjaGlsZC5wYXJlbnQud2lkdGggLSBjaGlsZC5fcmVzaXplUHJvcHMucGluLm1heFhcblx0XHRcdG1heFk6IGNoaWxkLnBhcmVudC5oZWlnaHQgLSBjaGlsZC5fcmVzaXplUHJvcHMucGluLm1heFlcblx0XHRcdFxuXHRcdCMgU2V0IHByb3BzXG5cdFx0Zm9yIGtleSwgdmFsdWUgb2YgcHJvcHNbY2hpbGQucmVzaXppbmddXG5cdFx0XHRjaGlsZFtrZXldID0gdmFsdWVcblx0XHRcdFxuXHQjIERFRklOSVRJT05TIOKAkyBQYXJlbnRcdFxuXHRAZGVmaW5lIFwicmVzaXplQ2hpbGRyZW5cIixcdFxuXHRcdGdldDogLT4gQF9yZXNpemVDaGlsZHJlblxuXHRcdHNldDogKHZhbHVlKSAtPlxuXHRcdFx0IyBFcnJvciBpZiBub3QgYm9vbGVhblxuXHRcdFx0aWYgXy5pc0Jvb2xlYW4odmFsdWUpIGlzIGZhbHNlIFxuXHRcdFx0XHR0aHJvdyBFcnJvciBcIidyZXNpemVDaGlsZHJlbicgbXVzdCBiZSB0cnVlIG9yIGZhbHNlXCJcblx0XHRcdFx0XG5cdFx0XHQjIEFkZCBvciByZW1vdmUgbGlzdGVuZXJcblx0XHRcdGlmIHZhbHVlXG5cdFx0XHRcdEBvbihcImNoYW5nZTpzaXplXCIsIEBfb25SZXNpemUpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdEBvZmYoXCJjaGFuZ2U6c2l6ZVwiLCBAX29uUmVzaXplKVxuXHRcdFx0XHRcblx0XHRcdEBfcmVzaXplQ2hpbGRyZW4gPSB2YWx1ZVxuXHRcdFx0XG5cdCMgREVGSU5JVElPTlMg4oCTIENoaWxkIFxuXHRAZGVmaW5lIFwicmVzaXppbmdcIixcblx0XHRnZXQ6IC0+IEBfcmVzaXppbmdcblx0XHRzZXQ6ICh2YWx1ZSkgLT5cblx0XHRcdCMgRXJyb3IgaWYgbm90IGEgc3VwcG9ydGVkIHR5cGVcblx0XHRcdGlmIF8uaW5kZXhPZihyZXNpemluZ1R5cGVzLCB2YWx1ZSkgaXMgLTFcblx0XHRcdFx0dGhyb3cgRXJyb3IgXCInI3t2YWx1ZX0nIGlzbid0IGEgc3VwcG9ydGVkIHJlc2l6aW5nIHR5cGVcIlxuXHRcdFx0XHRcblx0XHRcdCMgQWRkIG9yIHJlbW92ZSBsaXN0ZW5lclxuXHRcdFx0aWYgdmFsdWUgaXNudCBcIm5vbmVcIlxuXHRcdFx0XHRAb24oXCJjaGFuZ2U6ZnJhbWVcIiwgQF9zZXRSZXNpemVQcm9wcylcblx0XHRcdFx0QG9uKFwiY2hhbmdlOnBhcmVudFwiLCBAX3NldFJlc2l6ZVByb3BzKVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRAb2ZmKFwiY2hhbmdlOmZyYW1lXCIsIEBfc2V0UmVzaXplUHJvcHMpXG5cdFx0XHRcdEBvZmYoXCJjaGFuZ2U6cGFyZW50XCIsIEBfc2V0UmVzaXplUHJvcHMpXG5cdFx0XHRcdFxuXHRcdFx0IyBTZXQgcmVzaXplIHByb3BzXG5cdFx0XHRAX3NldFJlc2l6ZVByb3BzKClcblx0XHRcdFxuXHRcdFx0QF9yZXNpemluZyA9IHZhbHVlXG5cdFx0XHRcblx0QGRlZmluZSBcIl9yZXNpemVQcm9wc1wiLFxuXHRcdGdldDogLT4gQF9yUHJvcHNcblx0XHRzZXQ6ICh2YWx1ZSkgLT4gQF9yUHJvcHMgPSB2YWx1ZVxuXHRcdFxuXHQjIE1JWElOXG5cdEBtaXhpbjogKENsYXNzKSAtPlxuXHRcdCMgRml4IGZvciBNb2JpbGVTY3JvbGxMYXllclxuXHRcdGNsZWFuQ2xhc3NOYW1lID0gaWYgL2xheWVyL2kudGVzdCBDbGFzcy5uYW1lIHRoZW4gXCJMYXllclwiIGVsc2UgQ2xhc3MubmFtZVxuXHRcdFxuXHRcdGNhcGl0YWxpemVGaXJzdExldHRlciA9IChzdHJpbmcpIC0+XG5cdFx0XHRyZXR1cm4gc3RyaW5nLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyaW5nLnNsaWNlKDEpXG5cdFx0XG5cdFx0Zm9yIGtleSwgdmFsdWUgb2YgZGVmYXVsdHNcblx0XHRcdEZyYW1lci5EZWZhdWx0c1tjbGVhbkNsYXNzTmFtZV1ba2V5XSA9IHZhbHVlIFxuXHRcdFx0XG5cdFx0XHRDbGFzcy5kZWZpbmUga2V5LFxuXHRcdFx0XHRjb25maWd1cmFibGU6IHRydWVcblx0XHRcdFx0Z2V0OiBAOjpbXCJnZXQje2NhcGl0YWxpemVGaXJzdExldHRlciBrZXl9XCJdXG5cdFx0XHRcdHNldDogQDo6W1wic2V0I3tjYXBpdGFsaXplRmlyc3RMZXR0ZXIga2V5fVwiXVxuXHRcdFx0XHRcblx0XHRDbGFzczo6X29uUmVzaXplID0gQDo6X29uUmVzaXplXG5cdFx0Q2xhc3M6Ol9zZXRSZXNpemVQcm9wcyA9IEA6Ol9zZXRSZXNpemVQcm9wc1xuXHRcdENsYXNzOjpfcmVzaXplQ2hpbGQgPSBAOjpfcmVzaXplQ2hpbGRcblxuR3JvdXBSZXNpemUubWl4aW4oTGF5ZXIpXG5cbm1vZHVsZT8uZXhwb3J0cyA9IEdyb3VwUmVzaXplIiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjkuMVxudmFyIEdyb3VwUmVzaXplLCBkZWZhdWx0cywgcmVzaXppbmdUeXBlcyxcbiAgZXh0ZW5kID0gZnVuY3Rpb24oY2hpbGQsIHBhcmVudCkgeyBmb3IgKHZhciBrZXkgaW4gcGFyZW50KSB7IGlmIChoYXNQcm9wLmNhbGwocGFyZW50LCBrZXkpKSBjaGlsZFtrZXldID0gcGFyZW50W2tleV07IH0gZnVuY3Rpb24gY3RvcigpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGNoaWxkOyB9IGN0b3IucHJvdG90eXBlID0gcGFyZW50LnByb3RvdHlwZTsgY2hpbGQucHJvdG90eXBlID0gbmV3IGN0b3IoKTsgY2hpbGQuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTsgcmV0dXJuIGNoaWxkOyB9LFxuICBoYXNQcm9wID0ge30uaGFzT3duUHJvcGVydHk7XG5cbmRlZmF1bHRzID0ge1xuICByZXNpemVDaGlsZHJlbjogZmFsc2UsXG4gIHJlc2l6aW5nOiBcIm5vbmVcIlxufTtcblxucmVzaXppbmdUeXBlcyA9IFtcIm5vbmVcIiwgXCJzdHJldGNoV2lkdGhcIiwgXCJzdHJldGNoSGVpZ2h0XCIsIFwic3RyZXRjaFwiLCBcInBpblhcIiwgXCJwaW5ZXCIsIFwicGluXCIsIFwicmVzaXplV2lkdGhcIiwgXCJyZXNpemVIZWlnaHRcIiwgXCJyZXNpemVcIiwgXCJmbG9hdFhcIiwgXCJmbG9hdFlcIiwgXCJmbG9hdFwiXTtcblxuR3JvdXBSZXNpemUgPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICBleHRlbmQoR3JvdXBSZXNpemUsIHN1cGVyQ2xhc3MpO1xuXG4gIGZ1bmN0aW9uIEdyb3VwUmVzaXplKG9wdGlvbnMpIHtcbiAgICB2YXIga2V5LCB2YWx1ZTtcbiAgICBpZiAob3B0aW9ucyA9PSBudWxsKSB7XG4gICAgICBvcHRpb25zID0ge307XG4gICAgfVxuICAgIGZvciAoa2V5IGluIGRlZmF1bHRzKSB7XG4gICAgICB2YWx1ZSA9IGRlZmF1bHRzW2tleV07XG4gICAgICBpZiAob3B0aW9uc1trZXldID09IG51bGwpIHtcbiAgICAgICAgb3B0aW9uc1trZXldID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICAgIEdyb3VwUmVzaXplLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuICB9XG5cbiAgR3JvdXBSZXNpemUucHJvdG90eXBlLl9vblJlc2l6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjaGlsZCwgaSwgbGVuLCByZWYsIHJlc3VsdHM7XG4gICAgaWYgKHRoaXMuY2hpbGRyZW4ubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJlZiA9IHRoaXMuY2hpbGRyZW47XG4gICAgcmVzdWx0cyA9IFtdO1xuICAgIGZvciAoaSA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgY2hpbGQgPSByZWZbaV07XG4gICAgICBpZiAoY2hpbGQucmVzaXppbmcgIT09IFwibm9uZVwiKSB7XG4gICAgICAgIHJlc3VsdHMucHVzaCh0aGlzLl9yZXNpemVDaGlsZChjaGlsZCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKHZvaWQgMCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIEdyb3VwUmVzaXplLnByb3RvdHlwZS5fc2V0UmVzaXplUHJvcHMgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5wYXJlbnQgPT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fcmVzaXplUHJvcHMgPSB7fTtcbiAgICB0aGlzLl9yZXNpemVQcm9wcy5mbG9hdCA9IHtcbiAgICAgIG1pZFg6IHRoaXMubWlkWCAvIHRoaXMucGFyZW50LndpZHRoLFxuICAgICAgbWlkWTogdGhpcy5taWRZIC8gdGhpcy5wYXJlbnQuaGVpZ2h0XG4gICAgfTtcbiAgICB0aGlzLl9yZXNpemVQcm9wcy5yZXNpemUgPSB7XG4gICAgICB3aWR0aDogdGhpcy53aWR0aCAvIHRoaXMucGFyZW50LndpZHRoLFxuICAgICAgaGVpZ2h0OiB0aGlzLmhlaWdodCAvIHRoaXMucGFyZW50LmhlaWdodCxcbiAgICAgIG1pZFg6IHRoaXMuX3Jlc2l6ZVByb3BzLmZsb2F0Lm1pZFgsXG4gICAgICBtaWRZOiB0aGlzLl9yZXNpemVQcm9wcy5mbG9hdC5taWRZXG4gICAgfTtcbiAgICB0aGlzLl9yZXNpemVQcm9wcy5zdHJldGNoID0ge1xuICAgICAgd2lkdGg6IHRoaXMuX3Jlc2l6ZVByb3BzLnJlc2l6ZS53aWR0aCxcbiAgICAgIGhlaWdodDogdGhpcy5fcmVzaXplUHJvcHMucmVzaXplLmhlaWdodFxuICAgIH07XG4gICAgcmV0dXJuIHRoaXMuX3Jlc2l6ZVByb3BzLnBpbiA9IHtcbiAgICAgIG1heFg6IHRoaXMucGFyZW50LndpZHRoIC0gdGhpcy5tYXhYLFxuICAgICAgbWF4WTogdGhpcy5wYXJlbnQuaGVpZ2h0IC0gdGhpcy5tYXhZXG4gICAgfTtcbiAgfTtcblxuICBHcm91cFJlc2l6ZS5wcm90b3R5cGUuX3Jlc2l6ZUNoaWxkID0gZnVuY3Rpb24oY2hpbGQpIHtcbiAgICB2YXIga2V5LCBwcm9wcywgcmVmLCByZXN1bHRzLCB2YWx1ZTtcbiAgICBwcm9wcyA9IHt9O1xuICAgIHByb3BzLmZsb2F0WCA9IHtcbiAgICAgIG1pZFg6IGNoaWxkLnBhcmVudC53aWR0aCAqIGNoaWxkLl9yZXNpemVQcm9wcy5mbG9hdC5taWRYXG4gICAgfTtcbiAgICBwcm9wcy5mbG9hdFkgPSB7XG4gICAgICBtaWRZOiBjaGlsZC5wYXJlbnQuaGVpZ2h0ICogY2hpbGQuX3Jlc2l6ZVByb3BzLmZsb2F0Lm1pZFlcbiAgICB9O1xuICAgIHByb3BzLmZsb2F0ID0ge1xuICAgICAgbWlkWDogY2hpbGQucGFyZW50LndpZHRoICogY2hpbGQuX3Jlc2l6ZVByb3BzLmZsb2F0Lm1pZFgsXG4gICAgICBtaWRZOiBjaGlsZC5wYXJlbnQuaGVpZ2h0ICogY2hpbGQuX3Jlc2l6ZVByb3BzLmZsb2F0Lm1pZFlcbiAgICB9O1xuICAgIHByb3BzLnJlc2l6ZVdpZHRoID0ge1xuICAgICAgd2lkdGg6IGNoaWxkLnBhcmVudC53aWR0aCAqIGNoaWxkLl9yZXNpemVQcm9wcy5yZXNpemUud2lkdGgsXG4gICAgICBtaWRYOiBwcm9wcy5mbG9hdC5taWRYXG4gICAgfTtcbiAgICBwcm9wcy5yZXNpemVIZWlnaHQgPSB7XG4gICAgICBoZWlnaHQ6IGNoaWxkLnBhcmVudC5oZWlnaHQgKiBjaGlsZC5fcmVzaXplUHJvcHMucmVzaXplLmhlaWdodCxcbiAgICAgIG1pZFk6IHByb3BzLmZsb2F0Lm1pZFlcbiAgICB9O1xuICAgIHByb3BzLnJlc2l6ZSA9IHtcbiAgICAgIHdpZHRoOiBjaGlsZC5wYXJlbnQud2lkdGggKiBjaGlsZC5fcmVzaXplUHJvcHMucmVzaXplLndpZHRoLFxuICAgICAgaGVpZ2h0OiBjaGlsZC5wYXJlbnQuaGVpZ2h0ICogY2hpbGQuX3Jlc2l6ZVByb3BzLnJlc2l6ZS5oZWlnaHQsXG4gICAgICBtaWRYOiBwcm9wcy5mbG9hdC5taWRYLFxuICAgICAgbWlkWTogcHJvcHMuZmxvYXQubWlkWVxuICAgIH07XG4gICAgcHJvcHMuc3RyZXRjaFdpZHRoID0ge1xuICAgICAgd2lkdGg6IHByb3BzLnJlc2l6ZS53aWR0aFxuICAgIH07XG4gICAgcHJvcHMuc3RyZXRjaEhlaWdodCA9IHtcbiAgICAgIGhlaWdodDogcHJvcHMucmVzaXplLmhlaWdodFxuICAgIH07XG4gICAgcHJvcHMuc3RyZXRjaCA9IHtcbiAgICAgIHdpZHRoOiBwcm9wcy5yZXNpemUud2lkdGgsXG4gICAgICBoZWlnaHQ6IHByb3BzLnJlc2l6ZS5oZWlnaHRcbiAgICB9O1xuICAgIHByb3BzLnBpblggPSB7XG4gICAgICBtYXhYOiBjaGlsZC5wYXJlbnQud2lkdGggLSBjaGlsZC5fcmVzaXplUHJvcHMucGluLm1heFhcbiAgICB9O1xuICAgIHByb3BzLnBpblkgPSB7XG4gICAgICBtYXhZOiBjaGlsZC5wYXJlbnQuaGVpZ2h0IC0gY2hpbGQuX3Jlc2l6ZVByb3BzLnBpbi5tYXhZXG4gICAgfTtcbiAgICBwcm9wcy5waW4gPSB7XG4gICAgICBtYXhYOiBjaGlsZC5wYXJlbnQud2lkdGggLSBjaGlsZC5fcmVzaXplUHJvcHMucGluLm1heFgsXG4gICAgICBtYXhZOiBjaGlsZC5wYXJlbnQuaGVpZ2h0IC0gY2hpbGQuX3Jlc2l6ZVByb3BzLnBpbi5tYXhZXG4gICAgfTtcbiAgICByZWYgPSBwcm9wc1tjaGlsZC5yZXNpemluZ107XG4gICAgcmVzdWx0cyA9IFtdO1xuICAgIGZvciAoa2V5IGluIHJlZikge1xuICAgICAgdmFsdWUgPSByZWZba2V5XTtcbiAgICAgIHJlc3VsdHMucHVzaChjaGlsZFtrZXldID0gdmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICBHcm91cFJlc2l6ZS5kZWZpbmUoXCJyZXNpemVDaGlsZHJlblwiLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9yZXNpemVDaGlsZHJlbjtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIGlmIChfLmlzQm9vbGVhbih2YWx1ZSkgPT09IGZhbHNlKSB7XG4gICAgICAgIHRocm93IEVycm9yKFwiJ3Jlc2l6ZUNoaWxkcmVuJyBtdXN0IGJlIHRydWUgb3IgZmFsc2VcIik7XG4gICAgICB9XG4gICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgdGhpcy5vbihcImNoYW5nZTpzaXplXCIsIHRoaXMuX29uUmVzaXplKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMub2ZmKFwiY2hhbmdlOnNpemVcIiwgdGhpcy5fb25SZXNpemUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuX3Jlc2l6ZUNoaWxkcmVuID0gdmFsdWU7XG4gICAgfVxuICB9KTtcblxuICBHcm91cFJlc2l6ZS5kZWZpbmUoXCJyZXNpemluZ1wiLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9yZXNpemluZztcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIGlmIChfLmluZGV4T2YocmVzaXppbmdUeXBlcywgdmFsdWUpID09PSAtMSkge1xuICAgICAgICB0aHJvdyBFcnJvcihcIidcIiArIHZhbHVlICsgXCInIGlzbid0IGEgc3VwcG9ydGVkIHJlc2l6aW5nIHR5cGVcIik7XG4gICAgICB9XG4gICAgICBpZiAodmFsdWUgIT09IFwibm9uZVwiKSB7XG4gICAgICAgIHRoaXMub24oXCJjaGFuZ2U6ZnJhbWVcIiwgdGhpcy5fc2V0UmVzaXplUHJvcHMpO1xuICAgICAgICB0aGlzLm9uKFwiY2hhbmdlOnBhcmVudFwiLCB0aGlzLl9zZXRSZXNpemVQcm9wcyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm9mZihcImNoYW5nZTpmcmFtZVwiLCB0aGlzLl9zZXRSZXNpemVQcm9wcyk7XG4gICAgICAgIHRoaXMub2ZmKFwiY2hhbmdlOnBhcmVudFwiLCB0aGlzLl9zZXRSZXNpemVQcm9wcyk7XG4gICAgICB9XG4gICAgICB0aGlzLl9zZXRSZXNpemVQcm9wcygpO1xuICAgICAgcmV0dXJuIHRoaXMuX3Jlc2l6aW5nID0gdmFsdWU7XG4gICAgfVxuICB9KTtcblxuICBHcm91cFJlc2l6ZS5kZWZpbmUoXCJfcmVzaXplUHJvcHNcIiwge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fclByb3BzO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX3JQcm9wcyA9IHZhbHVlO1xuICAgIH1cbiAgfSk7XG5cbiAgR3JvdXBSZXNpemUubWl4aW4gPSBmdW5jdGlvbihDbGFzcykge1xuICAgIHZhciBjYXBpdGFsaXplRmlyc3RMZXR0ZXIsIGNsZWFuQ2xhc3NOYW1lLCBrZXksIHZhbHVlO1xuICAgIGNsZWFuQ2xhc3NOYW1lID0gL2xheWVyL2kudGVzdChDbGFzcy5uYW1lKSA/IFwiTGF5ZXJcIiA6IENsYXNzLm5hbWU7XG4gICAgY2FwaXRhbGl6ZUZpcnN0TGV0dGVyID0gZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgICByZXR1cm4gc3RyaW5nLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyaW5nLnNsaWNlKDEpO1xuICAgIH07XG4gICAgZm9yIChrZXkgaW4gZGVmYXVsdHMpIHtcbiAgICAgIHZhbHVlID0gZGVmYXVsdHNba2V5XTtcbiAgICAgIEZyYW1lci5EZWZhdWx0c1tjbGVhbkNsYXNzTmFtZV1ba2V5XSA9IHZhbHVlO1xuICAgICAgQ2xhc3MuZGVmaW5lKGtleSwge1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGdldDogdGhpcy5wcm90b3R5cGVbXCJnZXRcIiArIChjYXBpdGFsaXplRmlyc3RMZXR0ZXIoa2V5KSldLFxuICAgICAgICBzZXQ6IHRoaXMucHJvdG90eXBlW1wic2V0XCIgKyAoY2FwaXRhbGl6ZUZpcnN0TGV0dGVyKGtleSkpXVxuICAgICAgfSk7XG4gICAgfVxuICAgIENsYXNzLnByb3RvdHlwZS5fb25SZXNpemUgPSB0aGlzLnByb3RvdHlwZS5fb25SZXNpemU7XG4gICAgQ2xhc3MucHJvdG90eXBlLl9zZXRSZXNpemVQcm9wcyA9IHRoaXMucHJvdG90eXBlLl9zZXRSZXNpemVQcm9wcztcbiAgICByZXR1cm4gQ2xhc3MucHJvdG90eXBlLl9yZXNpemVDaGlsZCA9IHRoaXMucHJvdG90eXBlLl9yZXNpemVDaGlsZDtcbiAgfTtcblxuICByZXR1cm4gR3JvdXBSZXNpemU7XG5cbn0pKExheWVyKTtcblxuR3JvdXBSZXNpemUubWl4aW4oTGF5ZXIpO1xuXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBtb2R1bGUgIT09IG51bGwpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBHcm91cFJlc2l6ZTtcbn1cbiJdfQ==
