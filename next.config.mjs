/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        // Expose API Key to the client-side for the Gemini integration
        API_KEY: process.env.API_KEY,
    },
    // Allow external images
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
};

export default nextConfig;