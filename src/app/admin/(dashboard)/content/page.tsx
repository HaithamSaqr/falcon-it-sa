import Link from "next/link";

/**
 * v2: FAQs and client quotes no longer render from this screen's data. The
 * stored rows and the /api/admin/content endpoint are kept untouched; this page
 * only points admins at the editors that now own that copy.
 */
export default function ContentPage() {
  const linkClasses = "font-medium text-cyan-700 underline underline-offset-2 hover:text-cyan-800";

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Content</h2>
        <p className="text-sm text-slate-500">
          FAQs and client quotes are no longer edited here. They are edited as blocks on the pages themselves.
        </p>
      </div>

      <div data-testid="content-moved-notice" className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-700">
        <div>
          <h3 className="font-semibold text-slate-900">FAQs</h3>
          <p className="mt-1">
            Edit the main questions in{" "}
            <Link href="/admin/pages/faq" className={linkClasses}>
              Pages &gt; FAQ
            </Link>
            . Each sector page also has its own FAQ block, edited in{" "}
            <Link href="/admin/pages" className={linkClasses}>
              Pages
            </Link>{" "}
            under Sectors.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Client quotes</h3>
          <p className="mt-1">
            Edit the quote block in{" "}
            <Link href="/admin/pages/home" className={linkClasses}>
              Pages &gt; Home
            </Link>
            . It is hidden on the site until you switch it on there.
          </p>
        </div>
        <p className="text-xs text-slate-400">
          The old FAQ and testimonial entries are kept in the database, so nothing was lost.
        </p>
      </div>
    </div>
  );
}
