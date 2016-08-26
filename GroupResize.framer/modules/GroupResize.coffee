defaults =
	props: resizeChildren: true, resizing: "none" 
	resizingTypes: ["none", "stretchWidth", "stretchHeight", "stretch", "pinX", "pinY", "pin", "resizeWidth", "resizeHeight", "resize", "floatX", "floatY", "float"]

class exports.GroupResizeLayer extends Layer
	constructor: (opts={}) ->
		# Set defaults
		for key, value of defaults.props
			opts[key] ?= value 
		super opts
	
	# FUNCTIONS – Parent	
	_onResize: ->
		# Return if no children
		return if @children.length is 0
		
		# Resize children
		for child in @children when child.resizing isnt "none"
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
		updatedProps = {}
		
		# FLOAT
		updatedProps.floatX = 
			midX: child.parent.width * child._resizeProps.float.midX
		
		updatedProps.floatY = 
			midY: child.parent.height * child._resizeProps.float.midY
		
		updatedProps.float = 
			midX: child.parent.width * child._resizeProps.float.midX
			midY: child.parent.height * child._resizeProps.float.midY
		
		# RESIZE
		updatedProps.resizeWidth = 
			width: child.parent.width * child._resizeProps.resize.width
			midX: updatedProps.float.midX
			
		updatedProps.resizeHeight = 	
			height: child.parent.height * child._resizeProps.resize.height
			midY: updatedProps.float.midY
		
		updatedProps.resize = 
			width: child.parent.width * child._resizeProps.resize.width
			height: child.parent.height * child._resizeProps.resize.height
			midX: updatedProps.float.midX
			midY: updatedProps.float.midY
		
		# STRETCH
		updatedProps.stretchWidth = 
			width: updatedProps.resize.width
	
		updatedProps.stretchHeight = 
			height: updatedProps.resize.height
	
		updatedProps.stretch = 
			width: updatedProps.resize.width
			height: updatedProps.resize.height
			
		# PIN 
		updatedProps.pinX = 
			maxX: child.parent.width - child._resizeProps.pin.maxX
		
		updatedProps.pinY = 
			maxY: child.parent.height - child._resizeProps.pin.maxY
		
		updatedProps.pin = 
			maxX: child.parent.width - child._resizeProps.pin.maxX
			maxY: child.parent.height - child._resizeProps.pin.maxY
			
		# Set using updatedProps
		for key, value of updatedProps[child.resizing]
			child[key] = value
			
	# DEFINITIONS – Parent	
	@define "resizeChildren",	
		get: -> @_resizeChildren
		set: (value) ->
			# Error if not boolean
			if _.isBoolean(value) is false 
				throw Error "ResizeChildren must be true or false"
				
			# Add or remove listener
			if value then @on("change:size", @_onResize) else @off("change:size", @_onResize)	
			
			# Set value
			@_resizeChildren = value
			
	# DEFINITIONS – Child 
	@define "resizing",
		get: -> @_resizing
		set: (value) ->
			# Error if not a supported type
			if _.indexOf(defaults.resizingTypes, value) is -1
				throw Error "'#{value}' isn't a supported resizing type"
				
			# Event listeners
			@on("change:frame", @_setResizeProps)
			@on("change:parent", @_setResizeProps)
			
			# Set resize props
			@_setResizeProps()
			
			# Set value
			@_resizing = value
		
	# Mixin
	@mixin: (Class) ->
		# Fix for MobileScrollLayer
		cleanClassName = if /layer/i.test Class.name then "Layer" else Class.name
		
		capitalizeFirstLetter = (string) ->
			return string.charAt(0).toUpperCase() + string.slice(1)
		
		for key, value of defaults.props
			Framer.Defaults[cleanClassName][key] = value 
			
			Class.define key,
				configurable: true
				get: @::["get#{capitalizeFirstLetter key}"]
				set: @::["set#{capitalizeFirstLetter key}"]
				
		Class::_onResize = @::_onResize
		Class::_setResizeProps = @::_setResizeProps
		Class::_resizeChild = @::_resizeChild