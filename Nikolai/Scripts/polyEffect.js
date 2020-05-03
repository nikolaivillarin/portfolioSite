/*------------------------------------*\
    Poly Effect on About Page
\*------------------------------------*/
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
    canvasScalarX: 3000,
    canvasScalarY: 500,
    // Tolerance for how close shards
    // can come within each other
    xCollisionTolerance: 200,
    yCollisionTolerance: 200
};

PolyEffect.prototype.Initialize = function () {
    this.svgElmt.querySelectorAll('path').forEach(shard => {
        this.shardElmts.push(new PolyShard(shard));
    });

    this.ScatterShards();
};

PolyEffect.prototype.GetRandomArbitrary = function (min, max) {
    /// <summary>
    /// The returned value is no lower than (and may possibly equal) min, and is less than (and not equal) max
    /// </summary>
    return Math.random() * (max - min) + min;
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
        quadrant = 'one';

        xModifier = this.GetRandomArbitrary(
            quadrants.minX,
            quadrants.verticalSeparator
        ) - shard.startPosition.x;

        yModifier = this.GetRandomArbitrary(
            quadrants.minY,
            quadrants.horizontalSeparator
        ) - shard.startPosition.y;
    } else if (shard.startPosition.x > quadrants.verticalSeparator &&
        shard.startPosition.y <= quadrants.verticalSeparator) {

        // Top Right
        quadrant = 'two';

        xModifier = this.GetRandomArbitrary(
            quadrants.verticalSeparator,
            quadrants.maxX
        ) - shard.startPosition.x;

        yModifier = this.GetRandomArbitrary(
            quadrants.minY,
            quadrants.horizontalSeparator
        ) - shard.startPosition.y;
    } else if (shard.startPosition.x <= quadrants.verticalSeparator &&
        shard.startPosition.y > quadrants.verticalSeparator) {
        // Bottom Left
        quadrant = 'three';

        xModifier = this.GetRandomArbitrary(
            quadrants.minX,
            quadrants.verticalSeparator
        ) - shard.startPosition.x;

        yModifier = this.GetRandomArbitrary(
            quadrants.horizontalSeparator,
            quadrants.maxY
        ) - shard.startPosition.y;
    } else {
        // Bottom Right
        quadrant = 'four';

        xModifier = this.GetRandomArbitrary(
            quadrants.verticalSeparator,
            quadrants.maxX
        ) - shard.startPosition.x;

        yModifier = this.GetRandomArbitrary(
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
    const maxIteration = 100;
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
            .Translate(posModifiers.xModifier, posModifiers.yModifier)
            .NormalizeTriangle();
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
    normalizedTrianlges: [
        'l-8,230-209,50Z',
        'l20,216-220,39Z',
        'l220,216-409,39Z',
        'l-262.9,58.9,74,166Z',
        'l-262.9,58.9,74,266Z',
        'l-254.26,166.82l164,215.94Z',
        'l202.81,97l-4-191Z',
        'l220,216-209,39Z',
        'l250,125-309,39Z',
        'l420,150-130,-239Z',
        'l200,116-209,239Z'
    ]
}

PolyShard.prototype.Initialize = function () {
    this.SetStartPosition();
    this.SetData();
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

PolyShard.prototype.NormalizeTriangle = function () {
    /// <summary>
    /// Uses a set of defined triangles and assigns the dimensions to this
    /// instance
    /// </summary>
    const randomIndex = Math.floor(Math.random() * this.normalizedTrianlges.length);
    const dataAttr = this.shardElmt.getAttribute('d');

    this.currentData = [
        dataAttr.split(/(?=[MLlZ])/)[0],
        this.normalizedTrianlges[randomIndex]
    ];

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