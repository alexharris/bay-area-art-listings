/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdn.sanity.io',
            },
        ],
    },
    experimental: {
        outputFileTracingIncludes: {
            '/api/generate-og': ['./src/app/api/generate-og/fonts/**'],
        },
    },
};

export default nextConfig;
