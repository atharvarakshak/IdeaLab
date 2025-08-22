import React, { useEffect } from "react";

const Editor = React.forwardRef(({ content }, ref) => {
  useEffect(() => {
    if (content && ref.current) {
      const iframe = ref.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

      // Validate content structure
      if (!content.navigation?.logo || !content.hero?.headline) {
        console.error("Invalid content structure:", content);
        return;
      }

      // Write the template to the iframe
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${content.navigation.logo}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
          <style>
            .section-scroll { scroll-margin-top: 100px; }
            .hover-scale { transition: transform 0.3s ease; }
          </style>
        </head>
        <body class="bg-gray-50">
          <!-- Navigation -->
          <nav class="bg-white shadow-lg fixed w-full z-10">
            <div class="max-w-7xl mx-auto px-4">
              <div class="flex justify-between items-center py-4">
                <div class="text-2xl font-bold text-blue-600">${
                  content.navigation.logo
                }</div>
                <div class="space-x-8">
                  ${content.navigation.links
                    .map(
                      (link) => `
                    <a href="#${link.toLowerCase()}" class="text-gray-700 hover:text-blue-600 transition-colors">${link}</a>
                  `
                    )
                    .join("")}
                </div>
              </div>
            </div>
          </nav>

          <!-- Hero Section -->
          <section id="home" class="section-scroll pt-32 pb-20">
            <div class="max-w-7xl mx-auto px-4 text-center">
              <h1 class="text-5xl font-bold mb-6 text-gray-800">${
                content.hero.headline
              }</h1>
              <p class="text-xl text-gray-600 mb-8">${
                content.hero.subheadline
              }</p>
              <button class="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                ${content.hero.cta}
              </button>
              <div class="mt-16">
                <img src="https://picsum.photos/1200/600" alt="Hero" class="rounded-lg shadow-xl mx-auto hover-scale">
              </div>
            </div>
          </section>

          <!-- Features Section -->
          <section id="features" class="section-scroll py-20 bg-white">
            <div class="max-w-7xl mx-auto px-4">
              <h2 class="text-3xl font-bold text-center mb-12 text-gray-800">Features</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                ${content.features
                  .map(
                    (feature) => `
                  <div class="p-6 bg-gray-50 rounded-lg hover-scale">
                    <i class="fas fa-${feature.icon} text-4xl text-blue-600 mb-4"></i>
                    <h3 class="text-xl font-bold mb-2 text-gray-800">${feature.title}</h3>
                    <p class="text-gray-600">${feature.description}</p>
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>
          </section>

          <!-- Testimonials Section -->
          <section id="testimonials" class="section-scroll py-20 bg-gray-50">
            <div class="max-w-7xl mx-auto px-4">
              <h2 class="text-3xl font-bold text-center mb-12 text-gray-800">What Our Users Say</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                ${content.testimonials
                  .map(
                    (testimonial) => `
                  <div class="p-6 bg-white rounded-lg shadow-md hover-scale">
                    <p class="text-gray-600 italic">"${testimonial.text}"</p>
                    <p class="mt-4 font-bold text-gray-800">— ${testimonial.author}</p>
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>
          </section>

          <!-- Pricing Section -->
          <section id="pricing" class="section-scroll py-20">
            <div class="max-w-7xl mx-auto px-4">
              <h2 class="text-3xl font-bold text-center mb-12 text-gray-800">Pricing</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                ${content.pricing
                  .map(
                    (plan) => `
                  <div class="bg-white p-8 rounded-lg shadow-lg hover-scale">
                    <h3 class="text-2xl font-bold mb-4 text-gray-800">${
                      plan.name
                    }</h3>
                    <div class="text-4xl font-bold mb-6 text-gray-800">$${
                      plan.price
                    }<span class="text-lg text-gray-500">/mo</span></div>
                    <ul class="mb-8">
                      ${plan.features
                        .map(
                          (feature) => `
                        <li class="mb-2 flex items-center text-gray-600">
                          <i class="fas fa-check text-green-500 mr-2"></i>
                          ${feature}
                        </li>
                      `
                        )
                        .join("")}
                    </ul>
                    <button class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Choose Plan
                    </button>
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>
          </section>

          <!-- Footer -->
          <footer class="bg-gray-800 text-white py-8">
            <div class="max-w-7xl mx-auto px-4 text-center">
              <p>${content.footer}</p>
            </div>
          </footer>
        </body>
        </html>
      `);
      iframeDoc.close();
    }
  }, [content, ref]);

  return (
    <iframe
      ref={ref}
      title="Professional Template"
      className="w-full h-[1500px] border-none mt-8 rounded-lg shadow-xl"
    />
  );
});

export default Editor;
