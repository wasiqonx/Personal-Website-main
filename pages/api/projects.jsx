export default async (req, res) => {
  const data = [
    {
      id: 1,
      image: "https://s3.ap-southeast-1.amazonaws.com/virtualprotocolcdn/29113_Sniper_Search_845ab21416.gif",
      name: "Sniper Search",
      description: "Sniper Search is a tool that allowd you to check if a token is safe to invest and get more info on it so you don't lose your investments",
      link: "https://snipersearch.fun",
    },
    {
      id: 2,
      image: "https://ik.imagekit.io/5lec115kqg/Mailimage_RwwxeJCuh5.png?updatedAt=1757260759918",
      name: "Forevermail",
      description: "Temporary Mail Bot is a Telegram bot that allows you to create temporary emails and receive emails in them. This bot is useful when you need to register for online services and don't want to give out your personal email address.",
      link: "https://github.com/wasiqonx/Forevermail",
    },
    {
      id: 3,
      image: "https://github.com/wasiqonx/Online-CA-WebPortal/raw/main/screenshots/screenshot2.jpg",
      name: "Online CA Portal",
      description: "Online CA portal for tuition teachers or universities platform to manage fees, exams, etc.",
      link: "https://github.com/wasiqonx/Online-CA-WebPortal",
    },
    {
      id: 4,
      image: "https://ik.imagekit.io/5lec115kqg/telegrambot.png?updatedAt=1757262321327",
      name: "Point Manager Bot",
      description: "Point Manager Bot is a Telegram bot that allows you to boost your channel and distribute items by making Your Subs as referrer.",
      link: "#",
    },
  ];
  res.status(200).json(data);
};
