/**
 * Label and arrow of a `link-arrow` whose label can wrap (add the class `link-arrow-wrap` to the link, site.css):
 * the last word and the arrow are kept together, so the arrow follows the text on a second line instead of sitting
 * alone at the far edge.
 */
export function LinkArrowLabel({ label }: { label: string }) {
  const cut = label.lastIndexOf(' ');
  return (
    <>
      {cut > 0 && `${label.slice(0, cut)} `}
      <span className="link-arrow-end">
        {label.slice(cut + 1)}
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
      </span>
    </>
  );
}
