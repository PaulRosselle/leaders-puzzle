export class GameUrlReader {
    /**
     * Returns the raw game state stored in the URL hash.
     */
    public static getRawState(url: string = window.location.href): string | null {
        const hash = new URL(url).hash;

        if (!hash || hash === "#") {
            return null;
        }

        return hash.slice(1);
    }
}