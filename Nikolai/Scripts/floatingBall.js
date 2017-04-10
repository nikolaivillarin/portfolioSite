/*------------------------------------*\
    Bubble Canvas Functionality
\*------------------------------------*/
function BubbleCanvas(canvasID) {
    /// <summary>
    /// Initializes the canvas to have the bubble effect
    /// </summary>
    /// <param name="canvasID" type="string">
    /// The ID of the canvas to draw the item on
    /// </param>
    var canvas = document.getElementById(canvasID);

    if (canvas === undefined || canvas === null) {
        throw new Error('Cannot find canvas with the ID of: ' + canvasID);
    }

    // Setters
    this.CanvasID = canvasID;

    this.SetSize();
    
    this.CanvasContext = canvas.getContext('2d');

    // Initializers
    this.Initialize();

    // Events
    $(window).resize(
        $.proxy(this.WindowResize, this)
    );
}

BubbleCanvas.prototype = {
    CanvasID: 0
    , CanvasContext: {}
    , TotalBubbles: 30
    , Bubbles: []
    , AnimationPaused: true
};

BubbleCanvas.prototype.Initialize = function () {
    /// <summary>
    /// Initializes bubble canvas but does not start the animation.
    /// You must call start animation to start the bubble animation
    /// </summary>
    for (var i = 0; i <= this.TotalBubbles; i++) {
        if (i % 2) {
            this.Bubbles.push(new FloatingBall(this.CanvasID, {
                BallType: 'blurred'
            }));
        } else {
            this.Bubbles.push(new FloatingBall(this.CanvasID));
        }
    }

    this.Render();
};

BubbleCanvas.prototype.StartAnimation = function () {
    if (this.AnimationPaused === true) {
        var that = this;

        this.AnimationPaused = false;

        (function drawFrame() {
            if (that.AnimationPaused === false) {
                window.requestAnimationFrame(drawFrame);

                that.Render();
            }
        }());
    }
};

BubbleCanvas.prototype.Render = function () {
    var canvas = document.getElementById(this.CanvasID);

    this.CanvasContext.clearRect(0, 0, canvas.width, canvas.height);

    this.DrawCanvasBG();

    for (var i = 0; i < this.Bubbles.length; i++) {
        this.Bubbles[i].Draw();
    }
};

BubbleCanvas.prototype.PauseAnimation = function () {
    this.AnimationPaused = true;
};

BubbleCanvas.prototype.WindowResize = function () {
    this.SetSize();

    this.Render();
};

BubbleCanvas.prototype.SetSize = function () {
    var $canvas = $('#' + this.CanvasID);

    $canvas.attr({
        width: $('#homeMainContent').width()
        , height: $('#homeMainContent').height()
    });

    this.UpdateFloatingBallProperties();
};

BubbleCanvas.prototype.UpdateFloatingBallProperties = function() {
    /// <summary>
    /// Update's the floating balls properties when are dependent on
    /// window size
    /// </summary>
    for (var i = 0; i < this.Bubbles.length; i++) {
        this.Bubbles[i].SetRadius();
        this.Bubbles[i].SetPosition();
    }
};

BubbleCanvas.prototype.DrawCanvasBG = function () {
    /// <summary>
    /// Draws the canvas background which is a gradient
    /// </summary>
    var canvas = document.getElementById(this.CanvasID);

    var bgGradient = this.CanvasContext.createLinearGradient(canvas.width, 0, 0, canvas.height);

    bgGradient.addColorStop(0, 'rgba(27, 218, 235, 0.4)');
    bgGradient.addColorStop(0.74, 'rgba(155, 59, 129, 0.5)');
    bgGradient.addColorStop(1, 'rgba(210, 126, 52, 0.5)');

    this.CanvasContext.fillStyle = bgGradient;
    this.CanvasContext.fillRect(0, 0, canvas.width, canvas.height);
};



/*------------------------------------*\
    Floating Ball Functionality
\*------------------------------------*/
function FloatingBall(canvasID, options) {
    /// <summary>
    /// Floating ball object.
    /// </summary>
    /// <param name="canvasID" type="string">
    /// The ID of the canvas to draw the item on
    /// </param>
    /// <param name="options" type="object">
    /// [Optional] An object hash that contains options for the floating balls.
    /// Options such as speed, radius, and color. Refer to the Options property
    /// for a full list of options
    /// </param>
    var canvas = document.getElementById(canvasID);

    if (canvas === undefined || canvas === null) {
        throw new Error('Cannot find canvas with the ID of: ' + canvasID);
    }

    this.Options.CanvasID = canvasID;
    this.Options.CanvasContext = canvas.getContext('2d');
    this.Options = $.extend({}, this.Options, options);

    this.Initialize();
}

FloatingBall.prototype.Options = {
    CanvasID: 0
    , CanvasContext: {}
    // Original Radius is the initially set radius
    // for the ball. This is required since the Radius
    // property will change if the size jitter is enabled
    , OriginalRadius: 0
    , Radius: 0
    // Position of the ball
    , X: 0
    // Position of the ball
    , Y: 0
    // Velocity on the X axis
    , VX: 0
    // Velocity on the Y axis
    , VY: 0 
    , Angle: 0
    , Speed: 0.1
    , Rotation: 0
    , ScaleX: 1
    , ScaleY: 1
    , Opacity: 0.0
    , BorderWidth: 1
    , BorderOpacity: 0.7
    , EnableSizeJitter: true
    , BallType: 'regular'
};

//#region Setters
FloatingBall.prototype.SetRadius = function () {
    /// <summary>
    /// Set's the initial radius of the ball based on
    /// the min and max radius specified
    /// </summary>
    var maxRadius = 0;

    if ($(window).height() > $(window).width()) {
        maxRadius = Math.floor($(window).height() / 20);
    } else {
        maxRadius = Math.floor($(window).width() / 20);
    }

    this.Options.Radius = Math.floor((Math.random() * maxRadius) + 1);

    this.Options.OriginalRadius = this.Options.Radius;
};

FloatingBall.prototype.SetOpacity = function () {
    /// <summary>
    /// Set's the initial Opacity for the ball
    /// </summary>
    var randomOpacity = (Math.random() * 0.3) + 0.1;

    this.Options.Opacity = parseFloat(randomOpacity.toFixed(1));
};

FloatingBall.prototype.SetDirection = function () {
    /// <summary>
    /// Set's the initial direction of the ball
    /// </summary>
    this.Options.Angle = Math.floor((Math.random() * 90));

    // Negative angles since we are starting at the bottom
    this.Options.Angle = this.Options.Angle * -1; 

    var radians = this.Options.Angle * Math.PI / 180;

    this.Options.VX = Math.cos(radians) * this.Options.Speed;
    this.Options.VY = Math.sin(radians) * this.Options.Speed;
};

FloatingBall.prototype.SetPosition = function () {
    /// <summary>
    /// Set's the initial position of the balls
    /// </summary>
    var canvas = document.getElementById(this.Options.CanvasID);

    var canvasXBoundary = canvas.width - this.Options.Radius;
    var canvasYBoundary = canvas.height - this.Options.Radius;

    this.Options.X = Math.floor((Math.random() * canvasXBoundary) + 1);
    this.Options.Y = Math.floor((Math.random() * canvasYBoundary) + 1);
};
//#endregion

//#region Methods
FloatingBall.prototype.Initialize = function () {
    this.SetRadius();
    this.SetOpacity();
    this.SetPosition();
    this.SetDirection();
    this.SizeJitterEffect();
};

FloatingBall.prototype.ResetPosition = function () {
    /// <summary>
    /// Randomly positions the floating balls at the bottom left of the canvas
    /// </summary>
    var canvas = document.getElementById(this.Options.CanvasID);

    this.Options.X = Math.floor((Math.random() * (canvas.width / 3)) + 1);
    this.Options.Y = canvas.height + this.Options.Radius;
};

FloatingBall.prototype.UpdateVelocity = function () {
    /// <summary>
    /// Update's the balls velocity, also checks to see if the ball has
    /// hit the containers boundaries. If so the ball is repositioned to the
    /// bottom of the canvas
    /// </summary>
    var canvas = document.getElementById(this.Options.CanvasID);
    var windX = 0.1;
    var windY = -0.1;

    if ($(window).width() > $(window).height()) { // Landscape
        windX = 0.1;
    } else {
        windX = 0.01;
    } // Portrait

    this.Options.X += this.Options.VX + windX;
    this.Options.Y += this.Options.VY + windY;

    // Horizontal Boundaries
    if (this.Options.X > canvas.width + (this.Options.Radius * 2)) {
        this.ResetPosition();
    } else if (this.Options.X < (this.Options.Radius * -2)) {
        this.ResetPosition();
    }

    // Vertical Boundaries
    if (this.Options.Y > canvas.height + (this.Options.Radius * 2)) {
        this.ResetPosition();
    } else if (this.Options.Y < (this.Options.Radius * -2)) {
        this.ResetPosition();
    }
};

FloatingBall.prototype.Draw = function () {
    /// <summary>
    /// Draws the floating ball onto the canvas
    /// </summary>
    this.UpdateVelocity();

    if (this.Options.BallType === 'regular') {
        this.DrawBall();
    } else {
        this.DrawBlurredBall();
    }
};

FloatingBall.prototype.DrawBall = function () {
    var radius = this.Options.Radius;
    var color = '#FFFFFF';
    var context = this.Options.CanvasContext;

    context.rotate(this.Options.Rotation);
    context.scale(this.Options.ScaleX, this.Options.ScaleY);
    context.lineWidth = this.Options.BorderWidth;
    context.strokeStyle = window.utils.colorToRGB(color, this.Options.BorderOpacity);
    context.fillStyle = window.utils.colorToRGB(color, this.Options.Opacity);
    context.beginPath();
    context.arc(this.Options.X, this.Options.Y, radius, 0, (Math.PI * 2), true);
    context.closePath();
    context.fill();
    context.stroke();
};

FloatingBall.prototype.DrawBlurredBall = function () {
    /// <summary>
    /// Draws a blurred ball
    /// </summary>
    var radius = this.Options.Radius;
    var color = '#FFFFFF';
    var context = this.Options.CanvasContext;

    context.save();

    context.translate(this.Options.X, this.Options.Y);
    context.rotate(this.Options.Rotation);
    context.scale(this.Options.ScaleX, this.Options.ScaleY);
    context.lineWidth = this.Options.BorderWidth;

    // Set Fill
    var radgrad = context.createRadialGradient(
        radius, radius, 0, radius, radius, radius);

    radgrad.addColorStop(0, window.utils.colorToRGB(color, this.Options.Opacity));

    var opacityVal2 = (this.Options.Opacity * 10 - 0.1 * 10) / 10; // Floating Point number fix

    radgrad.addColorStop(0.9, window.utils.colorToRGB(color, opacityVal2));
    radgrad.addColorStop(1, window.utils.colorToRGB(color, 0));

    context.fillStyle = radgrad;

    // Fake Circle, using a rectangle instead for the blur effect
    context.fillRect(0, 0, this.Options.Radius * 2, this.Options.Radius * 2);

    context.closePath();

    context.restore();
};

FloatingBall.prototype.SizeJitterEffect = function () {
    /// <summary>
    /// Pulsates the size of the floating ball
    /// </summary>
    var that = this;
    var delay = (Math.random() * 1000) + 500;
    var radiusModifier = Math.random() < 0.5 ? -1 : 1;

    var intervalID = setInterval(function () {
        if (that.Options.EnableSizeJitter === false) {
            window.clearInterval(intervalID);
        }

        var minSize = that.Options.OriginalRadius - 20;

        if (minSize < 1) {
            minSize = 1;
        }

        var maxSize = that.Options.OriginalRadius + 20;

        if (that.Options.Radius === minSize && radiusModifier < 0
            || that.Options.Radius === maxSize && radiusModifier > 0) {
            // Reverse direction
            radiusModifier *= -1;
        }

        that.Options.Radius = that.Options.Radius + radiusModifier;
    }, delay);
};
//endregion