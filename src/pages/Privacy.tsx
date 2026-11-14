import { PageTop } from "../components/ui";

export default function Privacy() {
  return (
    <>
      <PageTop
        name="Maxfiylik siyosati"
        eyebrow="Ochiq va tushunarli"
        title={[
          "Ma’lumotlaringizga",
          <span className="accent" key="a">
            mas’uliyat bilan.
          </span>,
        ]}
      />
      <article className="container prose">
        <p>Ushbu siyosat AlifBit.org saytidagi buyurtma va murojaat shakllariga taalluqli.</p>
        <h2>Nimalarni yig‘amiz?</h2>
        <p>
          Ismingiz, aloqa manzilingiz, tanlagan xizmat, loyiha tavsifi va ixtiyoriy kiritgan byudjet,
          muddat hamda fayllar saqlanadi. Spamdan himoyalanish uchun IP manzilning maxfiy kalit bilan
          xeshlangan ko‘rinishi vaqtincha ishlatiladi; IP manzilning o‘zi bazaga yozilmaydi.
        </p>
        <h2>Nima uchun ishlatamiz?</h2>
        <p>
          Murojaatingizni ko‘rib chiqish, siz bilan bog‘lanish va taklif tayyorlash uchun.
          Ma’lumotlaringiz sotilmaydi va reklama ro‘yxatlariga avtomatik qo‘shilmaydi.
        </p>
        <h2>Saqlash va kirish</h2>
        <p>
          Murojaatlar va fayllarga faqat vakolatli administrator kiradi. Murojaat faol ishlovda
          bo‘lmasa, u yakunlangan yoki oxirgi o‘zgartirilgan sanadan boshlab 12 oy ichida o‘chiriladi.
          Shartnoma yoki qonun bo‘yicha saqlash zarur bo‘lgan ma’lumotlar bundan mustasno. O‘chirish va
          saqlash nazorati administrator tomonidan bajariladi.
        </p>
        <h2>Bildirishnomalar</h2>
        <p>
          Bildirishnoma xizmati sozlangan bo‘lsa, administratorning yopiq Telegram chatiga faqat yangi
          murojaat raqami yuboriladi. To‘liq murojaat va biriktirilgan fayl ochiq chatlarga
          yuborilmaydi.
        </p>
        <h2>Cookie va mahalliy saqlash</h2>
        <p>
          Administratorga kirish uchun xavfsiz sessiya cookie ishlatiladi. Oddiy tashrifchining
          brauzerida kirish animatsiyasini takrorlamaslik uchun kichik belgi saqlanadi. Saytda reklama
          kuzatuvchilari o‘rnatilmagan.
        </p>
        <h2>Ma’lumotni o‘chirish</h2>
        <p>
          Murojaat raqamingizni ko‘rsatib{" "}
          <a href="https://t.me/alifbitbot?start=alifbit" target="_blank" rel="noreferrer">
            @alifbitbot
          </a>{" "}
          orqali ma’lumotingizni ko‘rish, tuzatish yoki o‘chirishni so‘rashingiz mumkin.
        </p>
      </article>
    </>
  );
}
