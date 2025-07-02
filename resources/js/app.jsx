// resources/js/app.js

import './bootstrap';
import Layout from './Layouts/Layout';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import '@/css/app.css'; 

createInertiaApp({
  resolve: async (name) => {
    const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
    const page = pages[`./Pages/${name}.jsx`];
    
    if (!page) {
      throw new Error(`Page not found: ${name}`);
    }

    // Conditionally apply layout
    const defaultLayout = name === 'Auth/Login' ? undefined : (page.default.layout || ((page) => <Layout>{page }</Layout>));
    
    return { default: page.default, layout: defaultLayout };
  },
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />);
  },
});
