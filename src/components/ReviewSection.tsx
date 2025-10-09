'use client';

export default function ReviewSection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-2xl mx-auto text-center px-6">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Your Opinion Matters
        </h2>
        <p className="mt-2 text-base text-slate-600">
          Share your experience on Trustpilot.
        </p>
        <div className="mt-8">
          <div
            className="trustpilot-widget inline-block"
            data-locale="en-US"
            data-template-id="56278e9abfbbba0bdcd568bc"
            data-businessunit-id="68cd3e85a5e773033d7242cf"
            data-style-height="52px"
            data-style-width="100%"
            data-token="4607939e-09dd-4f65-8fed-06bda9352f4e"
          >
            <a
              href="https://www.trustpilot.com/review/submonth.com"
              target="_blank"
              rel="noopener"
            >
              Trustpilot
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}