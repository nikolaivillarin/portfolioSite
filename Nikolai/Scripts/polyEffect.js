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
    shardElmts: []
};

PolyEffect.prototype.Initialize = function () {
    this.svgElmt.querySelectorAll('path').forEach(shard => {
        this.shardElmts.push(new PolyShard(shard));
    });
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
    this.originalData = [];

    // Initalizer
    this.Initialize();
}

PolyShard.prototype = {
    shardElmt: null,
    startPosition: {},
    originalData: [],
    currentData: [],
}

PolyShard.prototype.Initialize = function () {
    this.SetPosition();
    this.SetData();
    this.Translate(100, 100);
};

PolyShard.prototype.SetData = function () {
    const dataAttr = this.shardElmt.getAttribute('d');

    if (dataAttr) {
        this.originalData = dataAttr.split(/(?=[MLlZ])/);
        this.currentData = dataAttr.split(/(?=[MLlZ])/);
    }
};

PolyShard.prototype.UpdateDataAttr = function () {
    this.shardElmt.setAttribute('d', this.currentData.join(''));
};

PolyShard.prototype.SetPosition = function () {
    const shardPos = this.shardElmt.getPointAtLength(0);

    this.startPosition = {
        x: shardPos.x,
        y: shardPos.y
    }
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

                if (i + 1 % 2 === 0) {
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
};
//#endregion