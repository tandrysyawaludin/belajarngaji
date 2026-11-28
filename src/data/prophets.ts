/**
 * Kisah 25 nabi untuk anak — ditulis ulang dengan kata-kata sederhana.
 * Ringkasan asli untuk Belajar Ngaji; bukan salinan dari buku mana pun.
 */
export interface Prophet {
  n: number;
  name: string;
  hook: string;
  story: string[];
  lesson: string;
}

export const PROPHETS: Prophet[] = [
  {
    n: 1,
    name: "Adam",
    hook: "Manusia pertama yang diciptakan Allah",
    story: [
      "Allah menciptakan Nabi Adam, manusia pertama. Allah mengajarkan kepadanya nama-nama semua benda, dan para malaikat pun kagum kepadanya.",
      "Adam tinggal di surga bersama Hawa. Mereka boleh makan apa saja, kecuali buah dari satu pohon. Setan membujuk mereka sampai mereka ikut memakannya.",
      "Adam sangat menyesal dan segera bertaubat. Allah Maha Pengampun. Lalu Adam turun ke bumi dan menjadi manusia pertama yang hidup di sana.",
    ],
    lesson: "Pelajaran: kalau berbuat salah, segera minta maaf dan bertaubat kepada Allah.",
  },
  {
    n: 2,
    name: "Idris",
    hook: "Nabi yang pintar dan rajin belajar",
    story: [
      "Nabi Idris adalah nabi yang sangat pintar. Beliau pandai menulis dan menjahit pakaian, pekerjaan yang belum banyak dikenal orang pada zamannya.",
      "Beliau rajin berdakwah mengajak orang menyembah Allah dan berbuat baik. Beliau juga suka belajar dan mengajarkan ilmu kepada kaumnya.",
      "Karena kesalehannya, Allah mengangkat Nabi Idris ke tempat yang tinggi dan mulia.",
    ],
    lesson: "Pelajaran: rajin belajar dan berilmu itu mulia.",
  },
  {
    n: 3,
    name: "Nuh",
    hook: "Membuat kapal besar atas perintah Allah",
    story: [
      "Nabi Nuh berdakwah kepada kaumnya selama waktu yang sangat lama. Beliau mengajak mereka menyembah Allah, tetapi banyak yang mengejeknya.",
      "Allah memerintahkan Nabi Nuh membuat kapal besar di atas bukit. Orang-orang menertawakannya, tetapi beliau tetap sabar dan taat.",
      "Ketika banjir besar datang, Nabi Nuh selamat di dalam kapal bersama orang-orang beriman dan hewan-hewan yang dibawa berpasang-pasangan.",
    ],
    lesson: "Pelajaran: sabar dan taat kepada Allah walau diejek orang.",
  },
  {
    n: 4,
    name: "Hud",
    hook: "Diutus kepada kaum 'Ad yang kuat",
    story: [
      "Nabi Hud diutus kepada kaum 'Ad. Mereka berbadan besar dan kuat, pandai membangun gedung tinggi, tetapi mereka sombong dan menyembah berhala.",
      "Nabi Hud mengajak mereka menyembah Allah dan bersyukur. Namun mereka menolak dan tetap sombong dengan kekuatannya.",
      "Lalu Allah mengirimkan angin yang sangat kencang. Orang-orang beriman bersama Nabi Hud selamat, sedangkan yang sombong binasa.",
    ],
    lesson: "Pelajaran: jangan sombong dengan kekuatan yang kita punya.",
  },
  {
    n: 5,
    name: "Shalih",
    hook: "Mukjizat unta betina untuk kaum Tsamud",
    story: [
      "Nabi Shalih diutus kepada kaum Tsamud yang pandai memahat rumah di gunung batu. Beliau mengajak mereka menyembah Allah saja.",
      "Sebagai tanda kebenaran, Allah menghadirkan seekor unta betina yang istimewa. Nabi Shalih berpesan agar unta itu dijaga dan tidak disakiti.",
      "Tetapi kaum yang jahat menyakiti unta itu dan tidak mau mendengar nasihat. Akhirnya mereka mendapat hukuman dari Allah.",
    ],
    lesson: "Pelajaran: sayangilah hewan dan jagalah amanah yang dipercayakan kepada kita.",
  },
  {
    n: 6,
    name: "Ibrahim",
    hook: "Pencari Tuhan sejati dan pembangun Ka'bah",
    story: [
      "Sejak muda, Nabi Ibrahim berpikir: bintang, bulan, dan matahari yang terbenam tidak mungkin Tuhan. Beliau yakin Tuhan adalah Allah, Pencipta langit dan bumi.",
      "Beliau menghancurkan berhala-berhala kaumnya. Raja yang marah melemparkannya ke api besar, tetapi atas izin Allah api itu menjadi dingin dan beliau selamat. Beliau juga diuji untuk menyembelih putranya, dan Allah menggantinya dengan seekor domba — dari sinilah asal Idul Adha.",
      "Bersama putranya, Ismail, Nabi Ibrahim membangun Ka'bah di Makkah, rumah Allah yang menjadi arah kiblat kita sampai sekarang.",
    ],
    lesson: "Pelajaran: berani membela kebenaran dan yakin kepada Allah.",
  },
  {
    n: 7,
    name: "Luth",
    hook: "Mengajak kaumnya meninggalkan perbuatan buruk",
    story: [
      "Nabi Luth adalah keponakan Nabi Ibrahim. Beliau diutus kepada penduduk sebuah kota yang suka berbuat buruk dan tidak mau mendengar nasihat.",
      "Nabi Luth terus mengajak mereka berbuat baik dan takut kepada Allah, tetapi mereka menolak dan mengejeknya.",
      "Akhirnya kota itu dihancurkan oleh hukuman Allah. Nabi Luth dan keluarganya yang beriman selamat, kecuali istrinya yang tidak taat.",
    ],
    lesson: "Pelajaran: jauhi perbuatan buruk dan dengarkan nasihat baik.",
  },
  {
    n: 8,
    name: "Ismail",
    hook: "Anak yang sabar, sumber air Zamzam muncul untuknya",
    story: [
      "Waktu masih bayi, Nabi Ismail tinggal bersama ibunya, Hajar, di lembah Makkah yang kering dan sepi. Ketika air habis, Ibu Hajar berlari antara bukit Safa dan Marwah mencari air.",
      "Atas kekuasaan Allah, memancarlah air Zamzam di dekat kaki bayi Ismail. Air itu tidak pernah kering sampai sekarang.",
      "Setelah besar, Ismail yang sabar dan patuh membantu ayahnya, Nabi Ibrahim, membangun Ka'bah.",
    ],
    lesson: "Pelajaran: sabar dan patuh kepada orang tua itu indah.",
  },
  {
    n: 9,
    name: "Ishaq",
    hook: "Kabar gembira untuk Ibrahim dan Sarah",
    story: [
      "Nabi Ibrahim dan istrinya, Sarah, sudah sangat tua dan belum mempunyai anak lagi. Suatu hari datanglah tamu malaikat membawa kabar gembira.",
      "Malaikat itu berkata bahwa Sarah akan melahirkan seorang anak bernama Ishaq. Sarah heran karena usianya sudah lanjut, tetapi bagi Allah semua mudah.",
      "Nabi Ishaq tumbuh menjadi nabi yang saleh. Beliau adalah ayah dari Nabi Ya'qub.",
    ],
    lesson: "Pelajaran: Allah Maha Kuasa memberi kabar gembira kapan saja.",
  },
  {
    n: 10,
    name: "Ya'qub",
    hook: "Ayah yang sangat sabar menanti Yusuf",
    story: [
      "Nabi Ya'qub disebut juga Israil. Beliau mempunyai dua belas anak, dan yang paling disayanginya adalah Yusuf.",
      "Ketika Yusuf hilang dan tidak pulang bertahun-tahun, Nabi Ya'qub sangat sedih sampai matanya tidak bisa melihat. Tetapi beliau tidak berhenti berdoa dan berharap kepada Allah.",
      "Akhirnya Allah mempertemukan mereka kembali. Nabi Ya'qub bisa melihat lagi dan memeluk Yusuf dengan bahagia.",
    ],
    lesson: "Pelajaran: sabar dan jangan pernah berhenti berdoa.",
  },
  {
    n: 11,
    name: "Yusuf",
    hook: "Pandai menafsirkan mimpi dan suka memaafkan",
    story: [
      "Nabi Yusuf bermimpi melihat sebelas bintang, matahari, dan bulan sujud kepadanya. Kakak-kakaknya yang iri memasukkannya ke dalam sumur, sampai ia dibawa orang ke negeri Mesir.",
      "Di Mesir, Nabi Yusuf yang jujur dan pandai menafsirkan mimpi raja diangkat menjadi bendahara negeri. Beliau menyiapkan makanan untuk masa paceklik.",
      "Ketika kakak-kakaknya datang meminta bantuan, Nabi Yusuf memaafkan mereka semua. Keluarganya pun berkumpul lagi dengan bahagia.",
    ],
    lesson: "Pelajaran: memaafkan kesalahan orang lain itu mulia.",
  },
  {
    n: 12,
    name: "Ayyub",
    hook: "Sangat sabar ketika sakit dan kehilangan harta",
    story: [
      "Nabi Ayyub adalah orang kaya yang saleh dan suka menolong. Kemudian Allah mengujinya: hartanya habis dan beliau sakit dalam waktu yang lama.",
      "Walaupun sakit dan susah, Nabi Ayyub tidak pernah berhenti berdoa dan bersyukur. Beliau tetap sabar dan tidak mengeluh kepada Allah.",
      "Karena kesabarannya, Allah menyembuhkan Nabi Ayyub dan mengembalikan kebahagiaannya.",
    ],
    lesson: "Pelajaran: sabar saat sakit dan susah, dan terus berdoa.",
  },
  {
    n: 13,
    name: "Syu'aib",
    hook: "Mengajak orang jujur dalam jual beli",
    story: [
      "Nabi Syu'aib diutus kepada penduduk Madyan. Mereka suka curang saat berdagang: mengurangi timbangan dan takaran untuk pembeli.",
      "Nabi Syu'aib mengajak mereka menyembah Allah dan berlaku jujur. Beliau berkata, cukupkanlah timbangan dan jangan merugikan orang lain.",
      "Sebagian orang beriman dan mengikuti beliau, tetapi yang tetap curang dan sombong mendapat hukuman dari Allah.",
    ],
    lesson: "Pelajaran: jujurlah dalam berdagang dan dalam segala hal.",
  },
  {
    n: 14,
    name: "Musa",
    hook: "Laut terbelah atas izin Allah",
    story: [
      "Saat bayi, Nabi Musa dihanyutkan ibunya di Sungai Nil agar selamat dari raja Fir'aun yang jahat. Beliau justru ditemukan dan diasuh di istana Fir'aun.",
      "Setelah dewasa, Allah mengutus Nabi Musa mengajak Fir'aun beriman. Tongkat Nabi Musa berubah menjadi ular sebagai tanda kekuasaan Allah, tetapi Fir'aun tetap sombong.",
      "Ketika dikejar tentara Fir'aun, Allah membelah laut untuk Nabi Musa dan pengikutnya sehingga mereka selamat. Beliau menerima kitab Taurat di Gunung Sinai.",
    ],
    lesson: "Pelajaran: Allah selalu menolong orang yang benar.",
  },
  {
    n: 15,
    name: "Harun",
    hook: "Kakak yang pandai bicara dan setia membantu",
    story: [
      "Nabi Harun adalah kakak Nabi Musa. Beliau pandai berbicara dengan lembut dan jelas.",
      "Nabi Musa meminta kepada Allah agar Harun membantunya berdakwah kepada Fir'aun. Allah mengabulkan permintaan itu.",
      "Berdua mereka menyampaikan kebenaran dengan berani. Nabi Harun selalu setia mendampingi adiknya dalam kebaikan.",
    ],
    lesson: "Pelajaran: saling membantu dalam kebaikan itu terpuji.",
  },
  {
    n: 16,
    name: "Zulkifli",
    hook: "Nabi yang adil dan selalu menepati janji",
    story: [
      "Nabi Zulkifli dikenal sebagai nabi yang sangat sabar dan adil. Beliau selalu menepati janji yang diucapkannya.",
      "Beliau sanggup berpuasa di siang hari, beribadah di malam hari, dan memutuskan perkara dengan adil tanpa marah.",
      "Karena sifatnya yang teguh dan jujur, Allah memuji Nabi Zulkifli sebagai hamba yang saleh.",
    ],
    lesson: "Pelajaran: tepatilah janji dan bersikaplah adil.",
  },
  {
    n: 17,
    name: "Daud",
    hook: "Pemuda berani yang diberi kitab Zabur",
    story: [
      "Waktu masih muda, Nabi Daud berani melawan Jalut, raksasa yang ditakuti semua orang. Dengan izin Allah, beliau menang hanya dengan ketapel dan batu.",
      "Allah memberi Nabi Daud kitab Zabur dan suara yang sangat merdu. Gunung-gunung dan burung-burung ikut bertasbih mendengar bacaannya.",
      "Nabi Daud rajin beribadah. Beliau suka berpuasa selang-seling sehari berpuasa sehari tidak, yang disebut puasa Daud.",
    ],
    lesson: "Pelajaran: berani karena Allah dan rajin beribadah.",
  },
  {
    n: 18,
    name: "Sulaiman",
    hook: "Raja bijaksana yang memahami bahasa hewan",
    story: [
      "Nabi Sulaiman adalah anak Nabi Daud. Allah memberinya kerajaan yang besar dan kemampuan memahami bahasa hewan, bahkan beliau bisa tersenyum mendengar perkataan semut.",
      "Beliau memakai ilmu dan kekuasaannya untuk kebaikan, bukan untuk sombong. Angin dan jin pun membantu pekerjaan beliau atas izin Allah.",
      "Ratu Bilqis dari negeri Saba' datang berkunjung. Melihat kebijaksanaan Nabi Sulaiman, sang ratu akhirnya beriman kepada Allah.",
    ],
    lesson: "Pelajaran: ilmu dan kekuasaan dipakai untuk kebaikan.",
  },
  {
    n: 19,
    name: "Ilyas",
    hook: "Mengajak kaumnya menyembah Allah saja",
    story: [
      "Nabi Ilyas diutus kepada kaum yang menyembah berhala bernama Baal. Mereka meninggalkan Allah, Pencipta mereka sendiri.",
      "Nabi Ilyas mengajak mereka kembali menyembah Allah dan meninggalkan berhala yang tidak bisa menolong apa pun.",
      "Sebagian kaumnya tetap menolak, tetapi Nabi Ilyas terus berdakwah dengan sabar dan berani.",
    ],
    lesson: "Pelajaran: hanya Allah yang kita sembah.",
  },
  {
    n: 20,
    name: "Ilyasa",
    hook: "Meneruskan dakwah Nabi Ilyas",
    story: [
      "Nabi Ilyasa adalah penerus Nabi Ilyas. Beliau melanjutkan dakwah mengajak kaumnya menyembah Allah.",
      "Dengan sabar beliau membimbing orang-orang yang mau beriman dan berbuat baik.",
      "Allah memuji Nabi Ilyasa sebagai hamba yang saleh dan terpilih.",
    ],
    lesson: "Pelajaran: teruskanlah kebaikan yang sudah dimulai.",
  },
  {
    n: 21,
    name: "Yunus",
    hook: "Berdoa di dalam perut ikan besar",
    story: [
      "Nabi Yunus meninggalkan kaumnya sebelum diperintah Allah. Di tengah laut, beliau terlempar ke air dan ditelan seekor ikan yang sangat besar.",
      "Di dalam perut ikan yang gelap, beliau berdoa: \"Laa ilaaha illaa anta, subhaanaka, innii kuntu minazh-zhaalimiin\" — tidak ada Tuhan selain Engkau, Maha Suci Engkau, sungguh aku termasuk orang yang zalim.",
      "Allah menyelamatkan Nabi Yunus. Beliau kembali kepada kaumnya, dan kali ini mereka semua beriman.",
    ],
    lesson: "Pelajaran: berdoa dan bertaubat bisa di mana saja, Allah pasti mendengar.",
  },
  {
    n: 22,
    name: "Zakaria",
    hook: "Tidak berhenti berdoa meminta anak",
    story: [
      "Nabi Zakaria sudah tua dan belum mempunyai anak. Setiap hari beliau berdoa dengan sungguh-sungguh meminta keturunan yang saleh.",
      "Beliau juga mengasuh Maryam dengan baik. Setiap kali masuk ke kamar Maryam, beliau menemukan makanan yang dikirim Allah.",
      "Akhirnya Allah mengabulkan doa Nabi Zakaria. Beliau dikaruniai anak bernama Yahya.",
    ],
    lesson: "Pelajaran: jangan berhenti berdoa, Allah Maha Mendengar.",
  },
  {
    n: 23,
    name: "Yahya",
    hook: "Bijaksana sejak kecil dan berani berkata benar",
    story: [
      "Nabi Yahya adalah anak Nabi Zakaria. Sejak kecil beliau sudah bijaksana dan rajin beribadah.",
      "Beliau berani berkata benar dan mengajak orang bertaubat serta berbuat baik.",
      "Nabi Yahya juga membantu dakwah Nabi Isa dan membenarkan ajarannya.",
    ],
    lesson: "Pelajaran: berani berkata benar sejak kecil.",
  },
  {
    n: 24,
    name: "Isa",
    hook: "Lahir dari Maryam dengan kekuasaan Allah",
    story: [
      "Nabi Isa lahir dari Ibu Maryam tanpa seorang ayah, dengan kekuasaan Allah. Saat masih bayi di gendongan, beliau sudah bisa berbicara untuk membela ibunya.",
      "Allah memberi Nabi Isa kitab Injil. Dengan izin Allah, beliau bisa menyembuhkan orang sakit dan menolong banyak orang.",
      "Ketika orang-orang jahat ingin menyakitinya, Allah mengangkat Nabi Isa ke langit dan menyelamatkannya.",
    ],
    lesson: "Pelajaran: Allah Maha Kuasa atas segala sesuatu.",
  },
  {
    n: 25,
    name: "Muhammad",
    hook: "Nabi terakhir, teladan terbaik untuk kita",
    story: [
      "Nabi Muhammad lahir di Makkah pada Tahun Gajah. Beliau yatim sejak kecil dan dibesarkan dengan penuh kesederhanaan. Semua orang memanggilnya Al-Amin, artinya yang jujur dan bisa dipercaya.",
      "Saat berusia 40 tahun, beliau menerima wahyu pertama di Gua Hira. Malaikat Jibril berkata, \"Iqra!\" — Bacalah! Sejak itu beliau mengajak orang menyembah Allah. Beliau hijrah ke Madinah, dan pada peristiwa Isra Mi'raj beliau menerima perintah sholat lima waktu.",
      "Akhlak Nabi Muhammad adalah Al-Qur'an. Beliau sangat sayang kepada anak-anak, orang miskin, bahkan hewan. Beliau adalah nabi terakhir dan teladan terbaik untuk kita semua.",
    ],
    lesson: "Pelajaran: jujur dan sayang kepada semua makhluk, seperti Rasulullah.",
  },
];
