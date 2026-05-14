/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: "class",
    theme: {
        extend: {
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
                mono: ["Fira Code", "monospace"],
            },
            colors: {
                // Light theme colors
                light: {
                    bg: "#F7F8FC",
                    card: "#FFFFFF",
                    sidebar: "#FFFFFF",
                    border: "#E4E7EC",
                    text: {
                        primary: "#111827",
                        secondary: "#6B7280",
                        muted: "#9CA3AF",
                    }
                },
                // Dark theme colors
                dark: {
                    bg: "#0F1117",
                    card: "#161B22",
                    sidebar: "#111827",
                    border: "#2A2F3A",
                    text: {
                        primary: "#F9FAFB",
                        secondary: "#CBD5E1",
                        muted: "#94A3B8",
                    }
                },
                // Brand purple gradient
                brand: {
                    primary: "#6D5EF5",
                    light: "#8B7CFF",
                    glow: "rgba(107, 94, 245, 0.1)",
                },
            },
            backgroundImage: {
                "brand-gradient": "linear-gradient(135deg, #6D5EF5 0%, #8B7CFF 100%)",
                "dark-brand-gradient": "linear-gradient(135deg, #8B7CFF 0%, #6D5EF5 100%)",
            },
            boxShadow: {
                "brand-glow": "0 0 20px rgba(107, 94, 245, 0.3)",
                "dark-glow": "0 0 20px rgba(139, 124, 255, 0.2)",
            },
        },
    },
    plugins: [],
};