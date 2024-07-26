const { Client, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv').config;
dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const NEWS_API_URL = 'http://localhost:3000/antara/terbaru'; // Pastikan URL menggunakan HTTP
const CHANNEL_ID = process.env.CHANNEL_ID; // Pastikan CHANNEL_ID benar

async function fetchLatestNews() {
    try {
        const fetch = await import('node-fetch'); // Dynamic import
        const response = await fetch.default(NEWS_API_URL);

        // Periksa status respons
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Debug log untuk memeriksa data yang diterima
        console.log('Fetched news data:', data);

        // Mengambil posts jika ada, jika tidak, return array kosong
        return data.data && data.data.posts ? data.data.posts : [];
    } catch (error) {
        console.error('Error fetching news:', error);
        return [];
    }
}

async function sendNewsToChannel() {
    const articles = await fetchLatestNews();

    // Debug log untuk memeriksa artikel
    console.log('Articles to send:', articles);

    const channel = client.channels.cache.get(CHANNEL_ID);

    if (channel && Array.isArray(articles) && articles.length > 0) {
        for (let i = 0; i < Math.min(3, articles.length); i++) { // Kirim hingga 3 berita terbaru
            const article = articles[i];
            const title = article.title || "No title";
            const description = article.description || "No description";
            const url = article.link || "No URL";
            const message = `**Berita Terbaru:**\n**${title}**\n${description}\n[Read more](${url})\n`;

            // Hanya kirimkan pesan teks tanpa gambar
            await channel.send(message);
        }
    } else {
        console.error('No articles found or channel not found!');
    }
}

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    // Mengirim berita setiap 30 menit
    sendNewsToChannel(); // Kirim segera saat bot mulai
    setInterval(sendNewsToChannel, 30 * 60 * 1000);
});

client.login(process.env.DISCORD_TOKEN);
