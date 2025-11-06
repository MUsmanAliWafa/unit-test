import { ref, onMounted } from "vue";

const theme = ref(localStorage.getItem("theme") || "light");

export function useTheme() {
  const applyTheme = () => {
    const isDark = theme.value === "dark";
    const html = document.documentElement;
    const body = document.body;

    // 1️⃣ Kalau ada .theme-fade → hapus dulu
    if (body.classList.contains("theme-fade")) {
      body.classList.remove("theme-fade");
    }

    // 2️⃣ Tambahkan .theme-transition
    body.classList.add("theme-transition");

    // 3️⃣ Batalkan timeout sebelumnya (kalau klik cepat)
    clearTimeout(body._themeTimeout);

    // 4️⃣ Terapkan mode gelap/terang
    if (isDark) {
      html.classList.add("dark");
      body.classList.remove("root");
      body.classList.add("dark");
    } else {
      html.classList.remove("dark");
      body.classList.remove("dark");
      body.classList.add("root");
    }

    // 5️⃣ Setelah .theme-transition selesai → hapus, lalu tambahkan .theme-fade
    body._themeTimeout = setTimeout(() => {
      body.classList.remove("theme-transition");
      body.classList.add("theme-fade");
    }, 300); // durasi harus sesuai CSS transition
  };

  // Tombol toggle
  const toggleTheme = () => {
    theme.value = theme.value === "dark" ? "light" : "dark";
    localStorage.setItem("theme", theme.value);
    applyTheme();
  };

  // Saat halaman dimuat ulang
  onMounted(() => {
    applyTheme();
  });

  return { theme, toggleTheme };
}
