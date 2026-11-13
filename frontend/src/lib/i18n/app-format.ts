/** Pure helpers for the app's ARB texts (no React), so they can be tested alone. */

export type Params = Record<string, string | number>;

/**
 * Fills an ARB message: `{name}` placeholders and the simple ICU plural form
 * the app uses (`{count, plural, =0{..} =1{..} other{..}}`).
 */
export function formatAppText(template: string, params: Params = {}): string {
  const plural = /\{(\w+), plural,((?:\s*(?:=\d+|zero|one|two|few|many|other)\s*\{(?:[^{}]|\{[^{}]*\})*\})+)\s*\}/g;
  let text = template.replace(plural, (_match, name: string, cases: string) => {
    const n = Number(params[name] ?? 0);
    const options = new Map<string, string>();
    for (const m of cases.matchAll(/\s*(=\d+|zero|one|two|few|many|other)\s*\{((?:[^{}]|\{[^{}]*\})*)\}/g)) {
      options.set(m[1], m[2]);
    }
    const chosen = options.get(`=${n}`) ?? (n === 1 ? options.get('one') : undefined) ?? options.get('other') ?? '';
    return chosen.replace(/\{(\w+)\}/g, (_m, key: string) => String(params[key] ?? (key === name ? n : `{${key}}`)));
  });
  text = text.replace(/\{(\w+)\}/g, (m, key: string) => (key in params ? String(params[key]) : m));
  return text;
}
