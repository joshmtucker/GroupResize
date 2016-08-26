{GroupResizeLayer} = require "GroupResize"
GroupResizeLayer.mixin(Layer)

Screen.backgroundColor = "#009688"

appBar = new Layer
	width: Screen.width
	height: 48
	backgroundColor: Utils.randomColor(1)
	
summaryHeader = new Layer
	y: appBar.maxY
	width: Screen.width
	height: 228
	backgroundColor: Utils.randomColor(1)
	
writeArea = new Layer 
	maxX: Screen.width
	y: summaryHeader.maxY
	width: Screen.width/2
	height: Screen.height - (appBar.height + summaryHeader.height) 
	
writeCard = new Layer 
	width: writeArea.width * .75
	height: writeArea.height * .75
	backgroundColor: "white"
	borderRadius: 2
	parent: writeArea
	resizing: "resize"
	
writeCard.center()

Framer.Device.phone.on "change:size", ->
	appBar.width = @width
	summaryHeader.width = @width
	
	writeArea.props = 
		maxX: @width
		width: @width - (@width/2)
		height: @height - (appBar.height+summaryHeader.height)
