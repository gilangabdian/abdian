// Style Pink & Purple
const styles = {
  title: "color: #EC4899; font-size: 20px; font-weight: bold; font-family: sans-serif;",
  subtitle: "color: #C084FC; font-size: 16px; font-weight: bold;",
  text: "color: #8B5CF6; font-size: 14px;",
  ascii: "color: #F9A8D4; font-family: monospace; font-size: 16px; font-weight: bold; line-height: 1.2;",
};

export const initConsoleFeatures = () => {
  try {
    console.clear();
  } catch (e) {}

  // ==========================================
  // 1. SAPAAN AWAL
  // ==========================================
  console.log(`%c✨ Selamat datang di portofolio Abdian 👋`, styles.title);
  console.log(`%cHalo developer, kamu menemukan console! 🕵️‍♂️`, styles.subtitle);
  console.log(`%cCoba ketik 'doodle' di console ini untuk melihat coretan rahasia 🎨`, styles.text);

  // ==========================================
  // 2. FITUR DOODLE (Random ASCII Art)
  // ==========================================
  const doodles = [
    `
     /\\_/\\
    ( o.o )
     > ^ <
    `, // Kucing 1
    `
     (\\(\\
     ( -.-)
     o_(")(")
    `, // Kelinci
    `
      ʕ•ᴥ•ʔ
    `, // Beruang
    `
       ( (
        ) )
      .........
      |       |]
      \\       /
       \`-----'
    `, // Kopi
    `
       .-.
      (o o) boo!
      | O \\
       \\   \\
        \`~~~'
    `, // Hantu
    `
       .---.
      / o o \\
      |  _  |
      \\ '-' /
       \`---'
    `, // Slime / Chibi face
    `
    |\\---/|
    | o_o |
     \\_^_/
    `, // Kucing kotak
    `
      < >
      (o o)
     /|||||\\
       / \\
    `, // Alien / Robot
    `
       _  _
      (.)(.)
     /  ()  \\
   _ \\ '--' / _
  { '-.\`""\`.-' }
   \`"/      \\"\`
     \\      /
    `, // Owl / Burung Hantu
    `
    (づ｡◕‿‿◕｡)づ
    `, // Kaomoji Hug
    `
       _
     >(.)__
      (___/
    `, // Bebek
    `
        .-'~~~'-.
      .'         '.
     /             \\
     ~--.       .--~
         \\     /
          \\   /
           | |
          /___\\
    `, // Jamur
    `
       .--.
    .-(    ).
   (___.__)__)
    `, // Awan
    `
     ><(((('>
    `, // Ikan
    `
      _
    _(_)_
   (_)@(_)
     (_)\\
         |
         |
    `, // Bunga
    `
      /\\_/\\
     ( ^.^ )
     / >  > \\
    `, // Kucing Senyum
    `
    O==[====================>
    `, // Pedang Pixel / Sword
    `
      \\_._/
      (o.o)
      (> <)
    `, // Baby Owl
    `
    (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧
    `, // Kaomoji Sparkle
    `
    ⊂((・▽・))⊃
    `, // Kaomoji Monkey Hug
    `
       _
     ('v')
    //-=-\\\\
    (\\_=_/)
     ^^ ^^
    `, // Pinguin
    `
      @..@
     (----)
    ( >__< )
    ^^ ~~ ^^
    `, // Katak
    `
     }\\{
     >x<
     }/{
    `, // Kupu-kupu
    `
       ,
      /|
     / |
    |\\ |
     \\|/
      |
    =====
     \\ /
      _
    `, // Tanaman Pot
    `
      _@_
     (_(_)>
    `, // Siput
    `
     /\\^/\\
    ((owo))
     /   \\
     \`"""\`
    `, // Kelelawar
    `
       . * .
     * * *
       * . *
    `, // Sparkles / Bintang
    `
    (=^-ω-^=) zzz
    `, // Kucing Tidur Kaomoji
    `
    (╯°□°）╯︵ ┻━┻
    `, // Flip Table Kaomoji
    `
    ʕ•̫͡•ʔ♡ʕ•̫͡•ʔ
    `, // Beruang Cinta Kaomoji
  ];

  Object.defineProperty(window, "doodle", {
    get: () => {
      // Mengambil gambar secara acak
      const randomDoodle = doodles[Math.floor(Math.random() * doodles.length)];

      // Hanya mencetak gambar ASCII murni
      console.log(`%c${randomDoodle}`, styles.ascii);

      // Tambahan info untuk mengetik 'doodle' lagi
      console.log(`%c(Ketik 'doodle' lagi untuk melihat gambar lainnya!)`, styles.text);

      return ""; // Menghindari output undefined di console
    },
    configurable: true,
  });
};
