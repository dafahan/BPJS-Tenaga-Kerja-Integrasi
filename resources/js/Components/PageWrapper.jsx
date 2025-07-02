// resources/js/Components/PageWrapper.jsx

import React from 'react';
import { usePage } from '@inertiajs/inertia-react';
import Layout from '@/js/Layouts/Layout';

const PageWrapper = ({ children }) => {
    const { url } = usePage(); // Use the hook here

    return <Layout url={url}>{children}</Layout>; // Pass the URL or any other props to Layout
};

export default PageWrapper;
