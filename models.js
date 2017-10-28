class Rect {
    constructor({ x = 0, y = 0, width = Infinity, height = Infinity } = {}) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    toSerializable() {
        return [
            [ this.x, this.y ],
            [ this.width, this.height ]
        ];
    }
}

module.exports = {
    Rect
};
