{GroupResize} = require "GroupResize"

Screen.backgroundColor = "#009688"

bg = new Layer 
	width: 480
	height: 380
	backgroundColor: "white"
	borderRadius: 2
	resizeChildren: true

bg.states.add
	small: width: 480, height: 380, x: (Screen.width/2) - (480/2), y: (Screen.height/2) - (380/2)
	large: width: 680, height: 580, x: (Screen.width/2) - (680/2), y: (Screen.height/2) - (580/2)
bg.states.switchInstant "small"
bg.filteredStates = bg.states._orderedStates.splice(1)
bg.states.switchInstant "small"

header = new Layer 
	height: 48
	width: bg.width
	parent: bg
	resizing: "resize"
	resizeChildren: true
	
btn = new Layer 
	width: 48
	height: 48
	maxX: header.width
	height: header.height
	parent: header
	resizing: "resize"
	
content = new Layer
	x: 16 
	y: header.maxY + 16
	width: bg.width - 32
	height: (bg.height - header.height) - 32
	parent: bg
	resizing: "float"
	
bg.onClick ->
	@states.next(@filteredStates)