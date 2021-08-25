export class DistanceHelper {
    static calculateLengthBetweenXCoordinates(number: number, leftX: number) {
        if (number < 0) {
            return Math.abs(number - leftX);
        }

        return Math.abs(Math.abs(leftX) + number);
    }

    static calculateLengthBetweenYCoordinates(number: number, topY: number) {
        if (number < 0) {
            return Math.abs(topY + Math.abs(number));
        }

        return Math.abs(topY - number);
    }
}