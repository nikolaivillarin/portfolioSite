/*------------------------------------*\
    Poly Effect on About Page
\*------------------------------------*/
//#region Global Helpers
const GetRandomArbitrary = function (min, max) {
    /// <summary>
    /// The returned value is no lower than (and may possibly equal) min, and is less than (and not equal) max
    /// </summary>
    return Math.random() * (max - min) + min;
};
//#endregion

//#region PolyEffect
function PolyEffect(svgElmt) {
    this.svgElmt = svgElmt;
    this.shardElmts = [];

    this.Initialize();
}

PolyEffect.prototype = {
    svgElmt: null,
    shardElmts: [],
    // Scalar to allow elements to go outside of
    // canvas
    canvasScalarX: 2000,
    canvasScalarY: 1000,
    // Tolerance for how close shards
    // can come within each other
    xCollisionTolerance: 200,
    yCollisionTolerance: 200,
    selectedEasing: 'easeOutBack'
};

PolyEffect.prototype.Initialize = function () {
    this.svgElmt.querySelectorAll('path').forEach(shard => {
        this.shardElmts.push(new PolyShard(shard));
    });

    this.ScatterShards();

    // Temp - replace with trigger
    //window.setTimeout(() => { this.StepToOriginalPosition() }, 5000);
};

PolyEffect.prototype.GetRandomPositionBasedOnQuadrants = function (shard, scalarX, scalarY) {
    /// <summary>
    /// Splits the canvas to 4 quadrants: top left, top right, bottom left, and bottom right.
    /// And based on which quadrant the shard falls into returns a random location within that
    /// Quadrant
    /// </summary>
    const quadrants = {
        verticalSeparator: this.svgElmt.viewBox.baseVal.width / 2,
        horizontalSeparator: this.svgElmt.viewBox.baseVal.height / 2,
        minX: -scalarX,
        maxX: this.svgElmt.viewBox.baseVal.width + scalarX,
        minY: -scalarY,
        maxY: this.svgElmt.viewBox.baseVal.height + scalarY
    };

    let xModifier = 0;
    let yModifier = 0;
    let quadrant = '';

    if (shard.startPosition.x <= quadrants.verticalSeparator &&
        shard.startPosition.y <= quadrants.verticalSeparator) {
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
        shard.startPosition.y <= quadrants.verticalSeparator) {

        // Top Right
        quadrant = 2;

        xModifier = GetRandomArbitrary(
            quadrants.verticalSeparator,
            quadrants.maxX
        ) - shard.startPosition.x;

        yModifier = GetRandomArbitrary(
            quadrants.minY,
            quadrants.horizontalSeparator
        ) - shard.startPosition.y;
    } else if (shard.startPosition.x <= quadrants.verticalSeparator &&
        shard.startPosition.y > quadrants.verticalSeparator) {
        // Bottom Left
        quadrant = 3;

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
        quadrant = 4;

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
        xModifier: Math.round(xModifier),
        yModifier: Math.round(yModifier)
    };
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

    for (let i = 0; i < this.shardElmts.length; i++) {
        let posModifiers = null;

        curIterationCount = 0;

        do {
            posModifiers = this.GetRandomPositionBasedOnQuadrants(
                this.shardElmts[i],
                this.canvasScalarX,
                this.canvasScalarY
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

PolyEffect.prototype.StepToOriginalPosition = function (animationDuration) {
    const that = this;
    const sortedShardElmts = this.shardElmts.sort((a, b) => a.quadrant - b.quadrant);

    for (let i = 0; i < sortedShardElmts.length; i++) {
        window.setTimeout(function () {
            const currentShardElmt = that.shardElmts[i];

            currentShardElmt.AnimateToOriginalPosition(this.selectedEasing);
        }, 50 * i);
    }
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
    sizeTolerance: {
        x: 400,
        y: 400
    },
    easingFunctions: {
        easeInCubic: (x, diff) => (x * x * x * diff),
        easeOutCubic: (x, diff) => ((1 - Math.pow(1 - x, 3)) * diff),
        easeOutBack: (x, diff) => {
            const c1 = 1.70158;
            const c3 = c1 + 1;

            return (1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)) * diff;
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

PolyShard.prototype.GetDiffFromCurrAndOrginalData = function () {
    let diffData = [];

    for (let i = 0; i < this.originalData.length; i++) {
        const originalDataKeyVal = this.GetKeyValPairsFromData(this.originalData[i], 1);
        const curDataKeyVal = this.GetKeyValPairsFromData(this.currentData[i], 1);
        let diffValues = [];

        for (let x = 0; x < originalDataKeyVal.length; x++) {
            diffValues.push(originalDataKeyVal[x] - curDataKeyVal[x]);
        }

        diffData.push(diffValues.join(','));
    }

    return diffData;
};

PolyShard.prototype.AnimateToOriginalPosition = function (easing) {
    const that = this;
    const animationDuration = 1000; // Milliseconds
    const stepDuration = 10; // Milliseconds
    const totalSteps = animationDuration / stepDuration;
    const stepper = 1 / totalSteps;
    const diffData = this.GetDiffFromCurrAndOrginalData();
    const currentData = this.currentData;
    let stepCount = 0;

    let animIntervalID = window.setInterval(function () {
        if (stepCount < 1) {
            that.EaseAnimation(diffData, currentData, stepCount, easing);

            stepCount = stepCount + stepper;
        } else {
            window.clearInterval(animIntervalID);

            that.currentData = that.originalData;
            that.UpdateDataAttr();
        }
    }, stepDuration);
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

PolyShard.prototype.StepToOriginalPosition = function (stepData) {
    let updatedDataAttr = [];

    for (let i = 0; i < this.currentData.length; i++) {
        const svgModifier = this.currentData[i].substring(0, 1);
        const curDataKeyVal = this.GetKeyValPairsFromData(this.currentData[i], 1);
        const stepDataKeyVal = this.GetKeyValPairsFromData(stepData[i]);
        let newValues = [];

        for (let x = 0; x < curDataKeyVal.length; x++) {
            if (curDataKeyVal[x] !== 0 &&
                stepDataKeyVal[x] !== 0) {
                newValues.push((curDataKeyVal[x] + stepDataKeyVal[x]).toFixed(4));
            } else {
                newValues.push(curDataKeyVal[x]);
            }
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

    return Math.pow(
        halfPerimeter *
        (halfPerimeter - lengthA) * 
        (halfPerimeter - lengthB) *
        (halfPerimeter - lengthC),
    0.5).toFixed(4);
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

PolyShard.prototype.NormalizeTriangle = function () {
    /// <summary>
    /// Normalizes the shape of the triangles to make them more constant
    /// </summary>
    const data = this.shardElmt.getAttribute('d').split(/(?=[MLlZ])/);
    const maxIterations = 50;
    const minAreaOfTriangle = 20000;

    let currentIterations = 0;
    let areaOfTriangle = 0;
    let updatedPath = [];

    do {
        updatedPath = this.GetRandomPathsForTriangleBasedOnShape(data);

        areaOfTriangle= this.GetAreaOfTriangle(updatedPath);

        currentIterations++;

        console.log('Iterations');
    } while (
        areaOfTriangle < minAreaOfTriangle &&
        currentIterations < maxIterations
    );

    this.currentData = updatedPath;

    this.UpdateDataAttr();

    return this;
};

PolyShard.prototype.Translate = function (xModifier, yModifer) {
    let updatedData = this.currentData.map(value => {
        if (value.indexOf('M') !== -1 ||
            value.indexOf('L') !== -1) {

            let svgModifier = value.substring(0, 1); 
            let keyValPairs = value.substring(1).split(/(?=[,-])/);
            let newValues = [];

            for (let i = 0; i < keyValPairs.length; i++) {
                const val = Number(keyValPairs[i].replace(',',''));

                if ((i + 1) % 2 === 0) {
                    // Even
                    newValues.push(val + yModifer);
                } else {
                    // Odd
                    newValues.push(val + xModifier);
                }
            }

            return svgModifier + newValues.join(',');
        } else {
            return value;
        }
    });

    this.currentData = updatedData;

    this.UpdateDataAttr();
    this.UpdatePosition();

    return this;
};
//#endregion