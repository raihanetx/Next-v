export default function FeaturesSection() {
  const features = [
    {
      icon: 'fa-dollar-sign',
      title: 'Affordable Price',
      description: 'Get top-tier content without breaking the bank. Quality education for everyone.',
    },
    {
      icon: 'fa-award',
      title: 'Premium Quality',
      description: 'Expert-curated content to ensure the best learning experience and outcomes.',
    },
    {
      icon: 'fa-shield-alt',
      title: 'Trusted',
      description: 'Join thousands of satisfied learners on our platform, building skills and careers.',
    },
    {
      icon: 'fa-lock',
      title: 'Secure Payment',
      description: 'Your transactions are protected with encrypted payment gateways for peace of mind.',
    },
  ];

  return (
    <section className="why-choose-us px-4 py-6">
      <h2 className="text-3xl font-bold text-center mb-12 font-display tracking-wider">
        Why Choose Us
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto">
        {features.map((feature, index) => (
          <div
            key={index}
            className="feature-card bg-white p-4 rounded-xl text-center flex flex-col justify-center md:aspect-square border border-gray-200 shadow-sm"
          >
            <div className="icon bg-[var(--primary-color-light)] w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <i className={`fas ${feature.icon} text-2xl text-[var(--primary-color)]`}></i>
            </div>
            <h3 className="text-lg font-bold mb-1 font-display tracking-wider">
              {feature.title}
            </h3>
            <p className="text-sm text-gray-600 mt-2 md:text-center text-left">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}