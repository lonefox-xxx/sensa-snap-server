function MoveFirstToLast(array) {
    if (array.length >= 1) {
        const firstElement = array.shift();
        array.push(firstElement);
    }

    return array
}

module.exports = MoveFirstToLast