export type Translations = Record<string, Record<string, string>>;

export function translate(
    translations: Translations,
    language: string,
    key: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
): string {
    const dict = translations[language] || translations["English"];
    let text = dict ? (dict[key] || key) : key;

    if (args.length > 0) {
        args.forEach((arg, index) => {
            text = text.replace(new RegExp(`\\{${index}\\}`, 'g'), String(arg));
        });
    }
    return text;
}
