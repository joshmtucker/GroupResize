# GroupResize
Set how layers react inside of their parent

## Setup
Add *GroupResize.coffee* to the modules folder of your Framer project. Include the module in your Framer project with the following code.

```coffeescript
{GroupResizeLayer} = require "GroupResize"
```

### Add GroupResizeLayer to Layer
To use GroupResize without creating a GroupResizeLayer, mix GroupResizeLayer into Layer.

```coffeescript
GroupResizeLayer.mixin(Layer)
```

## Properties
### resizeChildren
Whether a layer's children resizes when its frame changes. Default is true.

```coffeescript
# Option 1: At layer creation
parent = new Layer 
  width: 280
  height: 120
  resizeChildren: true
  
# Option 2: Anytime after layer creation
parent.resizeChildren = false
```

### resizing
How a layer should resize when its parent changes frame. Default is "none".

```coffeescript
# Option 1: At layer creation
child = new Layer 
  width: 50
  height: 50
  resizing: "pin"
  
# Option 2: Anytime after layer creation
child.resizing = "none"
```

#### Types
Name | Description 
--- | ---
"none" | No resize
"stretch" | Changes size proportionally to its parent 
"stretchWidth" | Changes width proportionally to its parent
"stretchHeight" | Changes height proportionally to its parent
"pin" | Maintains same distance from bottom right corner of parent as it resizes
"pinX" | Maintains same x-distance from bottom right corner of parent as it resizes
"pinY" | Maintains same y-distance from bottom right corner of parent as it resizes
"resize" | Changes size proportionally to parent **AND** maintains same distance from bottom right corner of parent as it resizes
"resizeWidth" | Changes width proportionally to parent **AND** maintains same x-distance from bottom right corner of parent as it resizes
"resizeHeight" | Changes height proportionally to parent **AND** maintains same y-distance from bottom right corner of parent as it resizes
"float" | Changes position proportionally to its parent
"floatX" | Changes x-position proportionally to its parent
"floatY" | Changes y-position proportionally to its parent



