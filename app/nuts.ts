export const NUTS_INFO = Array.from({length: 11}).map((_, i) => ({
    id: i,
    name: `Mystic Nut ${i + 1}`,
    latinName: `Nux Mystica ${i + 1}`,
    generalInfo: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula.`,
    allergyInfo: `Contains traces of lorem ipsum. May cause excessive gaming.`,
}));
