defaults = 
	resizeChildren: false
	resizing: "none"
	
resizingTypes = ["none", "stretchWidth", "stretchHeight", "stretch", "pinX", "pinY", "pin", "resizeWidth", "resizeHeight", "resize", "floatX", "floatY", "float"]

class GroupResize extends Layer
	constructor: (options={}) ->
		for key, value of defaults
			options[key] ?= value 
		super options
	
	# FUNCTIONS – Parent	
	_onResize: ->
		# Return if no children
		return if @children.length is 0
		
		# Resize children
		for child in @children
			if child.resizing isnt "none"
				@_resizeChild(child)
				
	# FUNCTIONS – Child
	_setResizeProps: ->
		# Return if no parent
		return if @parent is null
		
		@_resizeProps = {}
		
		# Float
		@_resizeProps.float = 
			midX: @midX/@parent.width
			midY: @midY/@parent.height
		
		# Resize
		@_resizeProps.resize = 
			width: @width/@parent.width
			height: @height/@parent.height
			midX: @_resizeProps.float.midX
			midY: @_resizeProps.float.midY
		
		# Stretch	
		@_resizeProps.stretch = 
			width: @_resizeProps.resize.width
			height: @_resizeProps.resize.height
		
		# Pin
		@_resizeProps.pin = 
			maxX: @parent.width - @maxX
			maxY: @parent.height - @maxY
					
	_resizeChild: (child) ->
		props = {}
		
		# FLOAT
		# floatX 
		props.floatX = 
			midX: child.parent.width * child._resizeProps.float.midX
		
		#floatY	
		props.floatY = 
			midY: child.parent.height * child._resizeProps.float.midY
		
		# float
		props.float = 
			midX: child.parent.width * child._resizeProps.float.midX
			midY: child.parent.height * child._resizeProps.float.midY
		
		# RESIZE
		# resizeWidth
		props.resizeWidth = 
			width: child.parent.width * child._resizeProps.resize.width
			midX: props.float.midX
		
		# resizeHeight	
		props.resizeHeight = 
			height: child.parent.height * child._resizeProps.resize.height
			midY: props.float.midY
		
		# resize
		props.resize = 
			width: child.parent.width * child._resizeProps.resize.width
			height: child.parent.height * child._resizeProps.resize.height
			midX: props.float.midX
			midY: props.float.midY
		
		# STRETCH 
		# stretchWidth
		props.stretchWidth = 
			width: props.resize.width
		
		# stretchHeight	
		props.stretchHeight = 
			height: props.resize.height
		
		# stretch		
		props.stretch = 
			width: props.resize.width
			height: props.resize.height
			
		# PIN 
		# pinX
		props.pinX = 
			maxX: child.parent.width - child._resizeProps.pin.maxX
		
		# pinY	
		props.pinY = 
			maxY: child.parent.height - child._resizeProps.pin.maxY
		
		# pin
		props.pin = 
			maxX: child.parent.width - child._resizeProps.pin.maxX
			maxY: child.parent.height - child._resizeProps.pin.maxY
			
		# Set props
		for key, value of props[child.resizing]
			child[key] = value
			
	# DEFINITIONS – Parent	
	@define "resizeChildren",	
		get: -> @_resizeChildren
		set: (value) ->
			# Error if not boolean
			if _.isBoolean(value) is false 
				throw Error "'resizeChildren' must be true or false"
				
			# Add or remove listener
			if value
				@on("change:size", @_onResize)
			else
				@off("change:size", @_onResize)
				
			@_resizeChildren = value
			
	# DEFINITIONS – Child 
	@define "resizing",
		get: -> @_resizing
		set: (value) ->
			# Error if not a supported type
			if _.indexOf(resizingTypes, value) is -1
				throw Error "'#{value}' isn't a supported resizing type"
				
			# Add or remove listener
			if value isnt "none"
				@on("change:frame", @_setResizeProps)
				@on("change:parent", @_setResizeProps)
			else
				@off("change:frame", @_setResizeProps)
				@off("change:parent", @_setResizeProps)
				
			# Set resize props
			@_setResizeProps()
			
			@_resizing = value
			
	@define "_resizeProps",
		get: -> @_rProps
		set: (value) -> @_rProps = value
		
	# MIXIN
	@mixin: (Class) ->
		# Fix for MobileScrollLayer
		cleanClassName = if /layer/i.test Class.name then "Layer" else Class.name
		
		capitalizeFirstLetter = (string) ->
			return string.charAt(0).toUpperCase() + string.slice(1)
		
		for key, value of defaults
			Framer.Defaults[cleanClassName][key] = value 
			
			Class.define key,
				configurable: true
				get: @::["get#{capitalizeFirstLetter key}"]
				set: @::["set#{capitalizeFirstLetter key}"]
				
		Class::_onResize = @::_onResize
		Class::_setResizeProps = @::_setResizeProps
		Class::_resizeChild = @::_resizeChild

GroupResize.mixin(Layer)

module?.exports = GroupResize