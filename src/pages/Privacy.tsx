import { PageTop } from "../components/ui";
import { tr } from "../lib/i18n";

export default function Privacy() {
  // «{bot}» o'rnida @alifbitbot havolasi turadi.
  const removal = tr(
    "Murojaat raqamingizni ko‘rsatib {bot} orqali ma’lumotingizni ko‘rish, tuzatish yoki o‘chirishni so‘rashingiz mumkin.",
  ).split("{bot}");
  return (
    <>
      <PageTop
        name={tr("Maxfiylik siyosati")}
        eyebrow={tr("Ochiq va tushunarli")}
        title={[
          tr("Ma’lumotlaringizga"),
          <span className="accent" key="a">
            {tr("mas’uliyat bilan.")}
          </span>,
        ]}
      />
      <article className="container prose">
        <p>{tr("Ushbu siyosat AlifBit.org saytidagi buyurtma va murojaat shakllariga taalluqli.")}</p>
        <h2>{tr("Nimalarni yig‘amiz?")}</h2>
        <p>
          {tr(
            "Ismingiz, aloqa manzilingiz, tanlagan xizmat, loyiha tavsifi va ixtiyoriy kiritgan byudjet, muddat hamda fayllar saqlanadi. Spamdan himoyalanish uchun IP manzilning maxfiy kalit bilan xeshlangan ko‘rinishi vaqtincha ishlatiladi; IP manzilning o‘zi bazaga yozilmaydi.",
          )}
        </p>
        <h2>{tr("Nima uchun ishlatamiz?")}</h2>
        <p>
          {tr(
            "Murojaatingizni ko‘rib chiqish, siz bilan bog‘lanish va taklif tayyorlash uchun. Ma’lumotlaringiz sotilmaydi va reklama ro‘yxatlariga avtomatik qo‘shilmaydi.",
          )}
        </p>
        <h2>{tr("Saqlash va kirish")}</h2>
        <p>
          {tr(
            "Murojaatlar va fayllarga faqat vakolatli administrator kiradi. Murojaat faol ishlovda bo‘lmasa, u yakunlangan yoki oxirgi o‘zgartirilgan sanadan boshlab 12 oy ichida o‘chiriladi. Shartnoma yoki qonun bo‘yicha saqlash zarur bo‘lgan ma’lumotlar bundan mustasno. O‘chirish va saqlash nazorati administrator tomonidan bajariladi.",
          )}
        </p>
        <h2>{tr("Bildirishnomalar")}</h2>
        <p>
          {tr(
            "Bildirishnoma xizmati sozlangan bo‘lsa, administratorning yopiq Telegram chatiga faqat yangi murojaat raqami yuboriladi. To‘liq murojaat va biriktirilgan fayl ochiq chatlarga yuborilmaydi.",
          )}
        </p>
        <h2>{tr("Cookie va mahalliy saqlash")}</h2>
        <p>
          {tr(
            "Administratorga kirish uchun xavfsiz sessiya cookie ishlatiladi. Oddiy tashrifchining brauzerida kirish animatsiyasini takrorlamaslik uchun kichik belgi saqlanadi. Saytda reklama kuzatuvchilari o‘rnatilmagan.",
          )}
        </p>
        <h2>{tr("Ma’lumotni o‘chirish")}</h2>
        <p>
          {removal[0]}
          <a href="https://t.me/alifbitbot?start=alifbit" target="_blank" rel="noreferrer">
            @alifbitbot
          </a>
          {removal[1]}
        </p>
      </article>
    </>
  );
}
