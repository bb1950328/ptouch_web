export type EditorType = "text" | "image" | "icon";

export function getSingleValue<T>(elements: E[], getter: (element: E) => T, defaultValue: T): T {
    let singleValue: T = getter(elements[0]);
    for (let i = 0; i < elements.length; i++) {
        let e = elements[i];
        let v = getter(e);
        if (v !== singleValue) {
            singleValue = defaultValue;
        }
    }
    return singleValue;
}