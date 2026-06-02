<div align="center">
  <img width="800" alt="Find My Nutz Banner" src="https://picsum.photos/800/300?random=1" />
  
  # 🥜 Find My Nutz

  **Where Allergy Education Meets Pixel Art Adventure & Artificial Intelligence**
  
  ![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
  ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
  ![Phaser](https://img.shields.io/badge/Phaser-4.1-31353F?style=for-the-badge&logo=phaser)
  ![Gemini AI](https://img.shields.io/badge/Google%20Gemini-AI-4285F4?style=for-the-badge&logo=google)
</div>

---

## 📖 About The Project

Did you know that nuts are one of the most common causes of fatal allergies worldwide? Yet reading medical guides about allergies often feels boring.

To bridge this gap, I built **Find My Nutz** — a web-based, top-down pixel-art exploration game. Players step into *Sawit Village* to help an NPC named Wowok collect 10 unique types of nuts. Rather than just reading facts, every nut discovered interactively reveals its scientific Latin name, general information, and crucial allergy warnings through an immersive gameplay experience.

## ✨ Key Features

- 🤖 **AI Nut Scanner (Google Gemini)**: Photograph real nuts in the real world! The AI will automatically identify them and display their botanical info, ready to be saved into your digital Encyclopedia.
- 🎡 **Gacha Spin Wheel & Companion Pets**: Use in-game coins to spin the Gacha and collect 6 unique companion pets. Each pet has special active skills (like freezing time or boosting speed) to assist your exploration.
- 🌙 **Dynamic Day & Night Mode**: Survive the challenging night atmosphere with limited visibility, but enjoy a **+10% bonus drop rate** for Legendary and Mythic nuts.
- 🏆 **Global Leaderboard**: Real-time completion tracking via **Firebase**. Compete with players worldwide to become the fastest nut collector!
- 📖 **Interactive Encyclopedia**: A complete collection gallery featuring a rarity system ranging from *Common* to *Mythic*.

## ⚙️ Tech Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS, TypeScript
- **Game Engine:** Phaser 4 (HTML5 Canvas 2D)
- **AI Integration:** Google Gemini API (via Next.js Server Actions)
- **Database:** Firebase Firestore (Real-time Leaderboard)
- **Deployment:** Docker Multi-stage Build, Google Cloud Run

---

## 🚀 Getting Started (Local Development)

Follow these steps to run the game locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v20 or higher)
- [Git](https://git-scm.com/)
- A Google Gemini API Key (Get it from [Google AI Studio](https://aistudio.google.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/find-my-nuts.git
   cd find-my-nuts
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Rename `.env.example` to `.env.local` and insert your Gemini API Key.
   ```bash
   GEMINI_API_KEY="AIzaSy_YOUR_API_KEY_HERE"
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to play the game!

---

## 🐳 Docker Deployment (Production)

This project is fully Dockerized and optimized for cloud deployment (e.g., Google Cloud Run) to prevent Out-Of-Memory errors during compilation.

1. **Build the Docker Image**
   ```bash
   docker build -t find-my-nuts .
   ```

2. **Run the Docker Container**
   ```bash
   docker run -p 3000:3000 -e GEMINI_API_KEY="YOUR_API_KEY" find-my-nuts
   ```

## 🎁 Bonus (Redeem Code)
Try entering the code **`JUARAVIBECODING`** in the main menu to instantly receive 500 bonus coins for your Gacha spins!

---
*Built with ❤️ for the #JuaraVibeCoding Hackathon.*
