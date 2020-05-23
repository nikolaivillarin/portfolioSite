/*------------------------------------*\
    Poly Effect on About Page
\*------------------------------------*/
//#region Global Helpers
const GetRandomArbitrary = function (min, max) {
    /// <summary>
    /// The returned value is no lower than (and may possibly equal) min, and is less than (and not equal) max
    /// </summary>
    return RoundTo((Math.random() * (max - min) + min), 4);
};

const GetRandomFromRange = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

function RoundTo(n, digits) {
    var negative = false;
    if (digits === undefined) {
        digits = 0;
    }
    if (n < 0) {
        negative = true;
        n = n * -1;
    }
    var multiplicator = Math.pow(10, digits);
    n = parseFloat((n * multiplicator).toFixed(11));
    n = (Math.round(n) / multiplicator).toFixed(2);
    if (negative) {
        n = (n * -1).toFixed(2);
    }
    return Number(n);
}
//#endregion

//#region PolyEffect
function PolyEffect(
    svgElmt,
    canvasScalarTop = 0,
    canvasScalarRight = 0,
    canvasScalarBottom = 0,
    canvasScalarLeft = 0
) {
    this.svgElmt = svgElmt;
    this.canvasScalarTop = canvasScalarTop;
    this.canvasScalarRight = canvasScalarRight;
    this.canvasScalarBottom = canvasScalarBottom;
    this.canvasScalarLeft = canvasScalarLeft;
    this.shardElmts = [];

    this.Initialize();
}

PolyEffect.prototype = {
    svgElmt: null,
    shardElmts: [],
    // Scalar to allow elements to go outside of
    // canvas
    canvasScalarTop: 0,
    canvasScalarRight: 0,
    canvasScalarBottom: 0,
    canvasScalarLeft: 0,
    // Tolerance for how close shards
    // can come within each other
    xCollisionTolerance: 200,
    yCollisionTolerance: 200,
    selectedEasing: 'easeOutCubic',
    pageTransition: {
        distance: 1000,
        duration: 600
    },
    AnimEndEventNames: {
        'WebkitAnimation': 'webkitAnimationEnd',
        'OAnimation': 'oAnimationEnd',
        'msAnimation': 'MSAnimationEnd',
        'animation': 'animationend'
    },
    GetAnimEndEventName: function () {
        /// <summary>
        /// Returns animation event prefixed by browser
        /// </summary>
        return this.AnimEndEventNames[window.Modernizr.prefixed('animation')];
    },
    IsScattered: false,
    TranslateAnimationComplete: true
};

PolyEffect.prototype.Initialize = function () {
    this.svgElmt.querySelectorAll('path').forEach(shard => {
        this.shardElmts.push(new PolyShard(shard));
    });

    this.ScatterShards();
};

PolyEffect.prototype.GetRandomPositionBasedOnQuadrants = function (shard) {
    /// <summary>
    /// Splits the canvas to 4 quadrants: top left, top right, bottom left, and bottom right.
    /// And based on which quadrant the shard falls into returns a random location within that
    /// Quadrant
    /// </summary>
    const quadrants = {
        // Line separating vertically 
        verticalSeparator: this.svgElmt.viewBox.baseVal.width / 2,
        // Line separating horizontally
        horizontalSeparator: this.svgElmt.viewBox.baseVal.height / 2,
        minX: -this.canvasScalarLeft,
        maxX: this.svgElmt.viewBox.baseVal.width + this.canvasScalarRight,
        minY: -this.canvasScalarTop,
        maxY: this.svgElmt.viewBox.baseVal.height + this.canvasScalarBottom
    };

    let xModifier = 0;
    let yModifier = 0;
    let quadrant = '';

    if (shard.startPosition.x <= quadrants.verticalSeparator &&
        shard.startPosition.y <= quadrants.horizontalSeparator) {
        // Top Left
        quadrant = 1;

        xModifier = GetRandomArbitrary(
            quadrants.minX,
            quadrants.verticalSeparator
        ) - shard.startPosition.x;

        yModifier = GetRandomArbitrary(
            quadrants.minY,
            quadrants.horizontalSeparator
        ) - shard.startPosition.y;
    } else if (shard.startPosition.x > quadrants.verticalSeparator &&
        shard.startPosition.y <= quadrants.horizontalSeparator) {
        // Top Right
        quadrant = 4;

        xModifier = GetRandomArbitrary(
            quadrants.verticalSeparator,
            quadrants.maxX
        ) - shard.startPosition.x;

        yModifier = GetRandomArbitrary(
            quadrants.minY,
            quadrants.horizontalSeparator
        ) - shard.startPosition.y;
    } else if (shard.startPosition.x <= quadrants.verticalSeparator &&
        shard.startPosition.y > quadrants.horizontalSeparator) {
        // Bottom Left
        quadrant = 2;

        xModifier = GetRandomArbitrary(
            quadrants.minX,
            quadrants.verticalSeparator
        ) - shard.startPosition.x;

        yModifier = GetRandomArbitrary(
            quadrants.horizontalSeparator,
            quadrants.maxY
        ) - shard.startPosition.y;
    } else {
        // Bottom Right
        quadrant = 3;

        xModifier = GetRandomArbitrary(
            quadrants.verticalSeparator,
            quadrants.maxX
        ) - shard.startPosition.x;

        yModifier = GetRandomArbitrary(
            quadrants.horizontalSeparator,
            quadrants.maxY
        ) - shard.startPosition.y;
    }

    return {
        quadrant: quadrant,
        xModifier: RoundTo(xModifier, 0),
        yModifier: RoundTo(yModifier, 0)
    };
};

PolyEffect.prototype.GetShardsSortedAsc = function () {
    /// <summary>
    /// Shard elements at the top will be in the top of the list
    /// </summary>
    return this.shardElmts.sort((a, b) => a.GetCurrentStartPos().y - b.GetCurrentStartPos().y);
};

PolyEffect.prototype.GetShardsSortedDesc = function () {
    /// <summary>
    /// Shard elements at the bottom will be in the top of the list
    /// </summary>
    return this.shardElmts.sort((a, b) => b.GetCurrentStartPos().y - a.GetCurrentStartPos().y);
};

PolyEffect.prototype.GetShardsSortedLeftToRight = function () {
    /// <summary>
    /// Shard elements at the left will be in the top of the list
    /// </summary>
    return this.shardElmts.sort((a, b) => a.GetCurrentStartPos().x - b.GetCurrentStartPos().x);
};

PolyEffect.prototype.GetShardsSortedRightToLeft = function () {
    /// <summary>
    /// Shard elements at the right will be in the top of the list
    /// </summary>
    return this.shardElmts.sort((a, b) => b.GetCurrentStartPos().x - a.GetCurrentStartPos().x);
};

PolyEffect.prototype.HasCollision = function (maxIndex, xPos, yPos) {
    for (let i = 0; i <= maxIndex; i++) {
        const curXPosDiff = Math.abs(this.shardElmts[i].currentPosition.x - xPos);
        const curYPosDiff = Math.abs(this.shardElmts[i].currentPosition.y - yPos);

        if (curXPosDiff < this.xCollisionTolerance ||
            curYPosDiff < this.yCollisionTolerance) {
            return true;
        }
    }

    return false;
};

PolyEffect.prototype.ScatterShards = function () {
    const maxIteration = 500;
    let curIterationCount = 0; // To prevent infinite loops

    this.IsScattered = true;

    for (let i = 0; i < this.shardElmts.length; i++) {
        let posModifiers = null;

        curIterationCount = 0;

        do {
            posModifiers = this.GetRandomPositionBasedOnQuadrants(
                this.shardElmts[i],
            );

            curIterationCount++;
        } while (
            curIterationCount <= maxIteration &&
            posModifiers &&
            this.HasCollision(i - 1, posModifiers.xModifier, posModifiers.yModifier)
        );

        this.shardElmts[i]
            .SetQuadrant(posModifiers.quadrant)
            .Translate(posModifiers.xModifier, posModifiers.yModifier)
            .NormalizeTriangle();
    }
};

PolyEffect.prototype.ExplodeShards = function () {
    const that = this;
    const maxIteration = 500;
    const shards = this.GetShardsSortedRightToLeft();
    let curIterationCount = 0; // To prevent infinite loops

    this.IsScattered = true;

    for (let i = 0; i < shards.length; i++) {
        const shard = shards[i];
        let posModifiers = null;

        curIterationCount = 0;

        do {
            posModifiers = this.GetRandomPositionBasedOnQuadrants(
                shard,
            );

            curIterationCount++;
        } while (
            curIterationCount <= maxIteration &&
            posModifiers &&
            this.HasCollision(i - 1, posModifiers.xModifier, posModifiers.yModifier)
        );

        let newPosition = shard.GetNormalizedTriangleData(
            shard.currentData
        );

        newPosition = shard.GetNewPositionData(
            newPosition,
            posModifiers.xModifier,
            posModifiers.yModifier
        );

        window.setTimeout(function () {
            const thisShard = shard;

            thisShard.AnimateToPosition(
                shard.currentData,
                newPosition,
                that.selectedEasing, {
                    animationDuration: that.pageTransition.duration,
                    completeCallback: () => {
                        thisShard
                            .SetQuadrant(posModifiers.quadrant)
                            .ResetAnimationState();
                }
            });
        }, 10 * i);
    }

    return this;
};

PolyEffect.prototype.TransitionToOriginalPosition = function (animationDuration, easing = this.selectedEasing) {
    const that = this;
    const sortedShards = this.shardElmts.sort((a, b) => a.quadrant - b.quadrant);

    this.TranslateAnimationComplete = false;

    let animationCompleteCount = 0;

    for (let i = 0; i < sortedShards.length; i++) {
        window.setTimeout(function () {
            const currentShardElmt = that.shardElmts[i];
            
            currentShardElmt
                .AnimateToOriginalPosition(easing, animationDuration, {
                    completeCallback: () => {
                        animationCompleteCount++;

                        if (animationCompleteCount === sortedShards.length) {
                            that.TranslateAnimationComplete = true;
                        }
                    }
                });
        }, 100 * i);
    }

    this.IsScattered = false;
};

PolyEffect.prototype.StartFloatAnimation = function () {
    for (let i = 0; i < this.shardElmts.length; i++) {
        this.shardElmts[i].StartFloatAnimation();
    }

    return this;
};

PolyEffect.prototype.PauseFloatAnimation = function () {
    for (let i = 0; i < this.shardElmts.length; i++) {
        this.shardElmts[i].PauseFloatAnimation();
    }

    return this;
};

PolyEffect.prototype.StartShakeAnimation = function () {
    for (let i = 0; i < this.shardElmts.length; i++) {
        this.shardElmts[i].StartShakeAnimation();
    }

    return this;
};

PolyEffect.prototype.PauseShakeAnimation = function () {
    for (let i = 0; i < this.shardElmts.length; i++) {
        this.shardElmts[i].PauseShakeAnimation();
    }

    return this;
};

PolyEffect.prototype.TransitionBottomToTop = function (
    animationDuration = this.pageTransition.duration,
    groupAnimScalar = 10
) {
    const that = this;
    const startYPos = this.pageTransition.distance;
    const sortedShards = this.GetShardsSortedAsc();

    this.TranslateAnimationComplete = false;

    let animationCompleteCount = 0;

    $(sortedShards).each((index, shard) => {
        const originalPosition = [...shard.currentData];
        const newPosition = shard.GetNewPositionData(shard.currentData, 0, startYPos);

        shard.Translate(0, startYPos);

        window.setTimeout(function () {
            const thisShard = shard;

            thisShard.AnimateToPosition(newPosition, originalPosition, that.selectedEasing, {
                animationDuration: animationDuration,
                completeCallback: () => {
                    animationCompleteCount++;

                    if (animationCompleteCount === sortedShards.length) {
                        that.TranslateAnimationComplete = true;
                    }
                }
            });
        }, groupAnimScalar * index);
    });

    return this;
};

PolyEffect.prototype.TransitionTopToBottom = function (
    animationDuration = this.pageTransition.duration,
    groupAnimScalar = 10
) {
    const that = this;
    const startYPos = this.pageTransition.distance * -1;
    const sortedShards = this.GetShardsSortedDesc();

    this.TranslateAnimationComplete = false;

    let animationCompleteCount = 0;

    $(sortedShards).each((index, shard) => {
        const originalPosition = [...shard.currentData];
        const newPosition = shard.GetNewPositionData(shard.currentData, 0, startYPos);

        shard.Translate(0, startYPos);

        window.setTimeout(function () {
            const thisShard = shard;

            thisShard.AnimateToPosition(newPosition, originalPosition, that.selectedEasing, {
                animationDuration: animationDuration,
                completeCallback: () => {
                    animationCompleteCount++;

                    if (animationCompleteCount === sortedShards.length) {
                        that.TranslateAnimationComplete = true;
                    }
                }
            });
        }, groupAnimScalar * index);
    });

    return this;
};

PolyEffect.prototype.TransitionLeftToRight = function (
    animationDuration = this.pageTransition.duration,
    groupAnimScalar = 10
) {
    const that = this;
    const startXPos = this.pageTransition.distance * -1;
    const sortedShards = this.GetShardsSortedRightToLeft();

    this.TranslateAnimationComplete = false;

    let animationCompleteCount = 0;

    $(sortedShards).each((index, shard) => {
        const originalPosition = [...shard.currentData];
        const newPosition = shard.GetNewPositionData(shard.currentData, startXPos, 0);

        shard.Translate(startXPos, 0);

        window.setTimeout(function () {
            const thisShard = shard;

            thisShard.AnimateToPosition(newPosition, originalPosition, that.selectedEasing, {
                animationDuration: animationDuration,
                completeCallback: () => {
                    animationCompleteCount++;

                    if (animationCompleteCount === sortedShards.length) {
                        that.TranslateAnimationComplete = true;
                    }
                }
            });
        }, groupAnimScalar * index);
    });

    return this;
};

PolyEffect.prototype.TransitionRightToLeft = function (
    animationDuration = this.pageTransition.duration,
    groupAnimScalar = 10
) {
    const that = this;
    const startXPos = this.pageTransition.distance;
    const sortedShards = this.GetShardsSortedLeftToRight();

    this.TranslateAnimationComplete = false;

    let animationCompleteCount = 0;

    $(sortedShards).each((index, shard) => {
        const originalPosition = [...shard.currentData];
        const newPosition = shard.GetNewPositionData(shard.currentData, startXPos, 0);

        shard.Translate(startXPos, 0);

        window.setTimeout(function () {
            const thisShard = shard;

            thisShard.AnimateToPosition(newPosition, originalPosition, that.selectedEasing, {
                animationDuration: animationDuration,
                completeCallback: () => {
                    animationCompleteCount++;

                    if (animationCompleteCount === sortedShards.length) {
                        that.TranslateAnimationComplete = true;
                    }
                }
            });
        }, groupAnimScalar * index);
    });

    return this;
};

PolyEffect.prototype.ShimmerTopToBottom = function (animationDuration = 2100, yTolerance = 800) {
    let shards = this.GetShardsSortedAsc();
    let currentY = -2000;

    const resetShards = function (previousShards) {
        if (previousShards) {
            window.setTimeout(() => {
                for (let i = 0; i < previousShards.length; i++) {
                    $(previousShards[i].shardElmt).removeClass('shard--shimmer');
                }
            }, animationDuration); // This delay should coincide with the animation duration set in css + 100ms
        }
    };

    (function animationFrame() {
        let shardsInRow = shards.filter(shard => (
            shard.GetCurrentStartPos().y <= currentY
        ));

        for (let i = 0; i < shardsInRow.length; i++) {
            $(shardsInRow[i].shardElmt).addClass('shard--shimmer');
        }

        resetShards(shards.slice(0, shardsInRow.length));
        shards = shards.slice(shardsInRow.length);

        if (shards.length > 0) {
            currentY += yTolerance;

            window.setTimeout(() => {
                animationFrame();
            }, 100); // This delay is for how long it takes to go down the screen
        }
    }());

    return this;
};
//#endregion

//#region PolyShard
function PolyShard(shardElmt) {
    /// <summary>
    /// Represents each shard element within the SVG.
    /// Specifically the path element
    /// </summary>
    this.shardElmt = shardElmt;
    this.startPosition = {};
    this.currentPosition = {};
    this.originalData = [];

    // Initializer
    this.Initialize();
}

PolyShard.prototype = {
    shardElmt: null,
    startPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    originalData: [],
    currentData: [],
    quadrant: 0, // Used by the container to designate the location of this shard
    floatAnimationPaused: true,
    shakeAnimationPaused: true,
    translateAnimationPause: true,
    sizeTolerance: {
        x: 600,
        y: 600
    },
    // Easing formulas based off: https://easings.net/
    easingFunctions: {
        easeInCubic: (x, diff) => (RoundTo((x * x * x * diff), 4)),
        easeOutCubic: (x, diff) => (RoundTo(((1 - Math.pow(1 - x, 3)) * diff), 4)),
        easeOutBack: (x, diff) => {
            const c1 = 1.70158;
            const c3 = c1 + 1;

            return RoundTo(((1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)) * diff), 4);
        },
        easeOutCirc: (x, diff) => (RoundTo(((Math.pow(1 - Math.pow(x - 1, 2), 0.5)) * diff), 4)),
        easeOutBounce: (x, diff) => {
            const n1 = 7.5625;
            const d1 = 2.75;

            if (x < 1 / d1) {
                return RoundTo(((n1 * x * x) * diff), 4);
            } else if (x < 2 / d1) {
                return RoundTo(((n1 * (x -= 1.5 / d1) * x + 0.75) * diff) , 4);
            } else if (x < 2.5 / d1) {
                return RoundTo(((n1 * (x -= 2.25 / d1) * x + 0.9375) * diff), 4);
            } else {
                return RoundTo(((n1 * (x -= 2.625 / d1) * x + 0.984375) * diff), 4);
            }
        }
    }
}

PolyShard.prototype.Initialize = function () {
    this.SetStartPosition();
    this.SetData();
};

PolyShard.prototype.GetSvgModifierFromData = function (data) {
    return data.substring(0, 1);
};

PolyShard.prototype.GetKeyValPairsFromData = function (data, skipIndex = 0) {
    return data
        .substring(skipIndex)
        .split(/(?=[,-])/)
        .filter((val) => {
            return val !== ',';
        }).map((val) => {
            return Number(val.replace(',', ''));
        });
};

PolyShard.prototype.GetDataDifference = function (dataA, DataB) {
    let diffData = [];

    for (let i = 0; i < dataA.length; i++) {
        const originalDataKeyVal = this.GetKeyValPairsFromData(dataA[i], 1);
        const curDataKeyVal = this.GetKeyValPairsFromData(DataB[i], 1);
        let diffValues = [];

        for (let x = 0; x < originalDataKeyVal.length; x++) {
            diffValues.push(originalDataKeyVal[x] - curDataKeyVal[x]);
        }

        diffData.push(diffValues.join(','));
    }

    return diffData;
};

PolyShard.prototype.AnimateToOriginalPosition = function (easing, animationDuration = 1000, {
    completeCallback = null }
) {
    const that = this;

    this.PauseAnimations();

    this.AnimateToPosition(this.currentData, this.originalData, easing, {
        animationDuration,
        completeCallback: () => {
            that.PauseShakeAnimation();

            if (completeCallback) {
                completeCallback();
            }
        },
        animationCompleteClass: 'AnimateToOriginalComplete'
    });
};

PolyShard.prototype.AnimateToPosition = function (startDataPoint, endDataPoint, easing, {
    animationDuration = 1000, stepDuration = 10, completeCallback = null, animationCompleteClass = '' }
) {
    const that = this;
    const totalSteps = animationDuration / stepDuration;
    const stepper = 1 / totalSteps;
    const diffData = this.GetDataDifference(endDataPoint, startDataPoint);

    let stepCount = 0;

    this.translateAnimationPause = false;

    // Function for closure
    let animIntervalID = window.setInterval(function () {
        if (stepCount < 1) {
            that.EaseAnimation(diffData, startDataPoint, stepCount, easing);

            stepCount = stepCount + stepper;
        } else if (that.translateAnimationPause) {
            window.clearInterval(animIntervalID);
        } else {
            window.clearInterval(animIntervalID);

            that.currentData = endDataPoint;
            that.UpdateDataAttr();

            if (animationCompleteClass) {
                that.shardElmt.classList.add(animationCompleteClass);
            }

            if (completeCallback) {
                completeCallback();
            }

            that.translateAnimationPause = true;
        }
    }, stepDuration);
};

PolyShard.prototype.ResetAnimationState = function () {
    $(this.shardElmt).removeClass('AnimateToOriginalComplete');
};

PolyShard.prototype.EaseAnimation = function (diffData, currentData, x, easing = 'easeInCubic') {
    let updatedDataAttr = [];
    
    for (let i = 0; i < currentData.length; i++) {
        const svgModifier = currentData[i].substring(0, 1);
        const curDataKeyVal = this.GetKeyValPairsFromData(currentData[i], 1);
        const diffDataKeyVal = this.GetKeyValPairsFromData(diffData[i]);
        let newValues = [];

        for (let z = 0; z < diffDataKeyVal.length; z++) {
            const y = this.easingFunctions[easing](x, diffDataKeyVal[z]);

            newValues.push(curDataKeyVal[z] + y);
        }

        if (svgModifier === 'Z') {
            updatedDataAttr.push(svgModifier);
        } else {
            updatedDataAttr.push(svgModifier + newValues.join(','));
        }
    }

    this.currentData = updatedDataAttr;
    this.UpdateDataAttr();
};

PolyShard.prototype.GetRandomPointBasedOnMoveAndTolerance = function (isPositive, isXAxis, tolerance) {
    let moveData = this.shardElmt.getAttribute('d').split(/(?=[MLlZ])/);
    let moveValue = 0;

    moveData = moveData[0].replace('M', '');

    if (isXAxis) {
        moveValue = Number(moveData.split(',')[0]);

        sizeTolerance = this.sizeTolerance.x;
    } else {
        moveValue = Number(moveData.split(',')[1]);

        sizeTolerance = this.sizeTolerance.y;
    }

    if (isPositive) {
        return Math.round(GetRandomArbitrary(
            moveValue + tolerance / 2,
            moveValue + tolerance
        ));
    } else {
        return Math.round(GetRandomArbitrary(
            moveValue - tolerance / 2,
            moveValue - tolerance
        ));
    }
};

PolyShard.prototype.GetLengthOfSideOfTriangle = function (point1, point2) {
    return Math.pow((Math.pow(point2[0] - point1[0], 2) + Math.pow(point2[1] - point1[1], 2)), 0.5);
};

PolyShard.prototype.GetPointsOfTriangle = function (pathData) {
    let points = [];

    for (let i = 0; i < pathData.length; i++) {
        const keyValPairs = pathData[i]
            .substring(1)
            .split(/(?=[,-])/)
            .filter(val => {
                return val !== ',';
            })
            .map(val => {
                return Number(val.replace(',', ''));
            });

        if (pathData[i].indexOf('M') !== -1) {
            // There is only one instance of M (Move to position)
            // in SVG
            points.push(keyValPairs);
        } else if (pathData[i].indexOf('L') !== -1) {
            // There can be multiple points for L (Line to)
            for (let x = 0; x < keyValPairs.length; x += 2) {
                points.push([keyValPairs[x], keyValPairs[x + 1]]);
            }
        } else if (pathData[i].indexOf('l') !== -1) {
            const relativePoint = points[points.length - 1];

            // There can be multiple points for l (Relative Line to)
            for (let x = 0; x < keyValPairs.length; x += 2) {
                points.push([
                    relativePoint[0] + keyValPairs[x],
                    relativePoint[1] + keyValPairs[x + 1]
                ]);
            }
        }
    }

    return points;
};

PolyShard.prototype.GetAreaOfTriangle = function (pathData) {
    const points = this.GetPointsOfTriangle(pathData);
    const lengthA = this.GetLengthOfSideOfTriangle(points[0], points[1]);
    const lengthB = this.GetLengthOfSideOfTriangle(points[1], points[2]);
    const lengthC = this.GetLengthOfSideOfTriangle(points[2], points[0]);

    const halfPerimeter = (lengthA + lengthB + lengthC) / 2;

    return RoundTo(Math.pow(
        halfPerimeter *
        (halfPerimeter - lengthA) * 
        (halfPerimeter - lengthB) *
        (halfPerimeter - lengthC),
    0.5), 4);
};

PolyShard.prototype.GetCurrentStartPos = function () {
    const data = this.GetKeyValPairsFromData(this.currentData[0], 1);

    return {
        x: data[0],
        y: data[1]
    };
};

PolyShard.prototype.SetQuadrant = function (quadrant) {
    this.quadrant = quadrant;

    return this;
};

PolyShard.prototype.SetData = function () {
    const dataAttr = this.shardElmt.getAttribute('d');

    if (dataAttr) {
        this.originalData = dataAttr.split(/(?=[MLlZ])/);
        this.currentData = dataAttr.split(/(?=[MLlZ])/);
    }

    return this;
};

PolyShard.prototype.UpdateDataAttr = function () {
    this.shardElmt.setAttribute('d', this.currentData.join(''));

    return this;
};

PolyShard.prototype.SetStartPosition = function () {
    const shardPos = this.shardElmt.getPointAtLength(0);

    this.startPosition = {
        x: shardPos.x,
        y: shardPos.y
    }

    this.UpdatePosition();

    return this;
};

PolyShard.prototype.UpdatePosition = function () {
    const shardPos = this.shardElmt.getPointAtLength(0);

    this.currentPosition = {
        x: shardPos.x,
        y: shardPos.y
    }

    return this;
};

PolyShard.prototype.GetRandomPathsForTriangleBasedOnShape = function (data) {
    return data.map((value) => {
        if (value.indexOf('L') !== -1) {
            let keyValPairs = value.substring(1).split(/(?=[,-])/).filter((val) => {
                return val !== ',';
            });
            let newValues = [];

            for (let i = 0; i < keyValPairs.length; i++) {
                let isPositive = Number(keyValPairs[i].replace(',', '')) >= 0;

                if ((i + 1) % 2 === 0) {
                    // Even - represents x
                    newValues.push(
                        this.GetRandomPointBasedOnMoveAndTolerance(isPositive, false, this.sizeTolerance.x)
                    );
                } else {
                    // Odd - represents y
                    newValues.push(
                        this.GetRandomPointBasedOnMoveAndTolerance(isPositive, true, this.sizeTolerance.y)
                    );
                }
            }

            return 'L' + newValues.join(',');
        } else if (value.indexOf('l') !== -1) {
            let keyValPairs = value.substring(1).split(/(?=[,-])/);
            let newValues = [];

            for (let i = 0; i < keyValPairs.length; i++) {
                let val = Number(keyValPairs[i].replace(',', ''));

                if (Math.abs(val) > this.sizeTolerance.x) {
                    do {
                        val = val / 2;
                    } while (Math.abs(val) > this.sizeTolerance.x);
                }

                newValues.push(val);
            }

            return 'l' + newValues.reduce((previous, current) => {
                if (current < 0) {
                    return String(previous) + String(current);
                } else {
                    return String(previous) + ',' + String(current);
                }
            });
        } else {
            return value;
        }
    });
};

PolyShard.prototype.GetNormalizedTriangleData = function (currentData) {
    const maxIterations = 50;
    const minAreaOfTriangle = 20000;

    let currentIterations = 0;
    let areaOfTriangle = 0;
    let updatedPath = [];

    do {
        updatedPath = this.GetRandomPathsForTriangleBasedOnShape(currentData);

        areaOfTriangle = this.GetAreaOfTriangle(updatedPath);

        currentIterations++;
    } while (
        areaOfTriangle < minAreaOfTriangle &&
        currentIterations < maxIterations
    );

    return updatedPath;
};

PolyShard.prototype.NormalizeTriangle = function () {
    /// <summary>
    /// Normalizes the shape of the triangles to make them more constant
    /// </summary>
    const data = this.shardElmt.getAttribute('d').split(/(?=[MLlZ])/);

    this.currentData = this.GetNormalizedTriangleData(data);

    this.UpdateDataAttr();

    return this;
};

PolyShard.prototype.StartShakeAnimation = function () {
    if (this.shakeAnimationPaused === true) {
        const that = this;
        const shakeVals = [-3, 3];

        let maxDistance = 3;
        let yDistance = 0, xDistance = 0;
        let x = shakeVals[GetRandomFromRange(0, 1)];
        let y = shakeVals[GetRandomFromRange(0, 1)];

        this.shakeAnimationPaused = false;

        (function drawFrame() {
            if (that.shakeAnimationPaused === false) {
                yDistance += 1;
                xDistance += 1;

                if (yDistance > maxDistance || xDistance > maxDistance) {
                    x = x * -1;
                    y = y * -1;

                    yDistance = 0;
                    xDistance = 0;
                }

                window.requestAnimationFrame(drawFrame);

                that.Translate(x, y);
            }
        }());
    }

    return this;
};

PolyShard.prototype.PauseShakeAnimation = function () {
    this.shakeAnimationPaused = true;

    return this;
};

PolyShard.prototype.StartFloatAnimation = function () {
    if (this.floatAnimationPaused === true) {
        const that = this;
        const maxDistance = 200;

        let x = Number(GetRandomArbitrary(-0.5, 0.5));
        let y = Number(GetRandomArbitrary(-0.5, 0.5));
        let yDistance = 0, xDistance = 0;

        this.floatAnimationPaused = false;

        (function drawFrame() {
            if (that.floatAnimationPaused === false) {
                yDistance += Math.pow(Math.pow(y, 2), 0.5);
                xDistance += Math.pow(Math.pow(x, 2), 0.5);

                if (yDistance > maxDistance || xDistance > maxDistance) {
                    x = x * -1;
                    y = y * -1;

                    yDistance = 0;
                    xDistance = 0;
                }

                window.requestAnimationFrame(drawFrame);

                that.Translate(x, y);
            }
        }());
    }

    return this;
};

PolyShard.prototype.PauseFloatAnimation = function () {
    this.floatAnimationPaused = true;

    return this;
};

PolyShard.prototype.PauseAnimations = function () {
    this.PauseFloatAnimation();
    this.PauseShakeAnimation();

    this.translateAnimationPause = true;

    return this;
};

PolyShard.prototype.GetNewPositionData = function (startPositionData, xModifier, yModifier) {
    return startPositionData.map(value => {
        if (value.indexOf('M') !== -1 ||
            value.indexOf('L') !== -1) {

            let svgModifier = value.substring(0, 1);
            let keyValPairs = value.substring(1).split(/(?=[,-])/).filter((val) => {
                return val !== ',';
            });
            let newValues = [];

            for (let i = 0; i < keyValPairs.length; i++) {
                const val = Number(keyValPairs[i].replace(',', ''));

                if ((i + 1) % 2 === 0) {
                    // Even
                    newValues.push(RoundTo(val + yModifier, 4));
                } else {
                    // Odd
                    newValues.push(RoundTo(val + xModifier, 4));
                }
            }

            return svgModifier + newValues.join(',');
        } else {
            return value;
        }
    });
}

PolyShard.prototype.Translate = function (xModifier, yModifer) {
    this.currentData = this.GetNewPositionData(this.currentData, xModifier, yModifer);

    this.UpdateDataAttr();
    this.UpdatePosition();

    return this;
};
//#endregion